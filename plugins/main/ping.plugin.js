import { performance } from 'perf_hooks'
import { Canvas, FontLibrary } from 'skia-canvas'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

let pingFontsLoaded = false
async function loadPingFonts() {
    if (pingFontsLoaded) return true
    const tempDir = path.join(process.cwd(), 'storage', 'temp')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    const fonts = [
        { name: 'RalewayExtraBold', url: global.font.Raleway.ExtraBold, file: 'Raleway-ExtraBold.ttf' },
        { name: 'MontserratItalic',  url: global.font.Montserrat.Italic,  file: 'Montserrat-LightItalic.ttf' }
    ]

    try {
        for (const f of fonts) {
            const fPath = path.join(tempDir, f.file)
            if (!fs.existsSync(fPath)) {
                const { data } = await axios.get(f.url, { responseType: 'arraybuffer' })
                fs.writeFileSync(fPath, data)
            }
            FontLibrary.use(f.name, [fPath])
        }
        pingFontsLoaded = true
    } catch (e) { console.error('[ping] Font error:', e.message) }
    return pingFontsLoaded
}

const formatUptime = (s) => {
    const d = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sc = Math.floor(s % 60)
    if (d > 0) return `${d}d ${h}h ${m}m`
    if (h > 0) return `${h}h ${m}m ${sc}s`
    return `${m}m ${sc}s`
}

export default {
    command: true,
    usePrefix: true,
    case: ['ping', 'speed', 'latencia'],
    category: 'main',
    description: 'Mide la latencia del bot y genera una tarjeta visual con información de rendimiento, tiempo activo y estado de conexión en tiempo real.',
    usage: 'ping',
    script: async (m, { sock }) => {
        const t0 = performance.now()
        await m.react('wait')
        const latency = (performance.now() - t0).toFixed(0)

        const uptime = formatUptime(process.uptime())

        const ms = parseInt(latency)
        const statusColor = ms < 200 ? '#10b981' : ms < 500 ? '#f59e0b' : '#ef4444'
        const statusLabel = ms < 200 ? 'ÓPTIMO' : ms < 500 ? 'REGULAR' : 'LENTO'
        const barFill = Math.min(Math.max((ms / 1000), 0.05), 1)

        await loadPingFonts()
        const fBold   = pingFontsLoaded ? '"RalewayExtraBold", sans-serif'  : 'sans-serif'
        const fItalic = pingFontsLoaded ? '"MontserratItalic", sans-serif'  : 'sans-serif'

        const W = 800, H = 220
        const canvas = new Canvas(W, H)
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, W, H)

        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 1
        for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke() }
        for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke() }

        ctx.fillStyle = statusColor
        ctx.fillRect(0, 0, 6, H)

        ctx.fillRect(0, 0, 200, 5)

        ctx.textAlign = 'left'
        ctx.fillStyle = '#ffffff'
        ctx.font = `120px ${fBold}`
        ctx.fillText(latency, 40, 150)

        ctx.font = `38px ${fBold}`
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        const msX = 40 + ctx.measureText(latency).width + 8
        ctx.font = `120px ${fBold}`
        const numW = ctx.measureText(latency).width
        ctx.font = `38px ${fBold}`
        ctx.fillText('ms', 40 + numW + 10, 145)

        ctx.font = `22px ${fBold}`
        ctx.fillStyle = statusColor
        ctx.fillText(statusLabel, 40, 185)

        const barX = 40, barY = 195, barW = 340, barH = 8
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.beginPath()
        ctx.roundRect(barX, barY, barW, barH, 4)
        ctx.fill()

        ctx.fillStyle = statusColor
        ctx.beginPath()
        ctx.roundRect(barX, barY, barW * barFill, barH, 4)
        ctx.fill()

        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(460, 30)
        ctx.lineTo(460, H - 30)
        ctx.stroke()

        const metrics = [
            { label: 'UPTIME',   value: uptime },
            { label: 'NODE',     value: process.version },
            { label: 'BOT',      value: global.config.name },
        ]

        let metY = 55
        for (const { label, value } of metrics) {
            ctx.font = `16px ${fItalic}`
            ctx.fillStyle = 'rgba(255,255,255,0.40)'
            ctx.textAlign = 'left'
            ctx.fillText(label, 490, metY)

            ctx.font = `26px ${fBold}`
            ctx.fillStyle = '#ffffff'
            ctx.fillText(value, 490, metY + 28)

            metY += 62
        }

        ctx.font = `15px ${fItalic}`
        ctx.fillStyle = 'rgba(255,255,255,0.18)'
        ctx.textAlign = 'right'
        ctx.fillText(`${global.config.name} · ping`, W - 20, H - 12)

        const buffer = await canvas.toBuffer('image/jpeg', { quality: 0.95 })

        await sock.sendMessage(m.chat.id, {
            image: buffer,
            caption: ''
        }, { quoted: m.message })

        await m.react('done')
    }
}
