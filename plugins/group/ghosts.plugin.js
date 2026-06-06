import { processBatch } from '../../library/modules/BatchProcess.js'

const TYPE_NAMES = {
    conversation: 'Texto',
    extendedTextMessage: 'Texto',
    imageMessage: 'Imagen',
    videoMessage: 'Video',
    stickerMessage: 'Sticker',
    audioMessage: 'Audio/Nota',
    documentMessage: 'Documento',
    viewOnceMessageV2: 'Efímero',
    reactionMessage: 'Reacción'
}

export default {
    command: true, usePrefix: true,
    case: ['ghosts', 'fantasmas', 'inactivos', 'check'],
    description: 'Analiza la actividad de los miembros del grupo, identifica usuarios inactivos, muestra estadísticas detalladas de participación y permite eliminar automáticamente cuentas sin actividad.',
    category: 'grupo',
    usage: ['ghosts', 'ghosts info @user', 'ghosts kick'],
    script: async (m, { sock }) => {
        if (!m.chat.isGroup) return m.reply('Solo para grupos.')

        const chatDB = await m.chat.db()
        const usersDB = chatDB.users || {}
        const subCmd = m.args[0]?.toLowerCase()

        if (subCmd === 'info' || subCmd === 'stats') {
            const target = m.sender.mentioned[0] || m.quoted?.sender.id || m.sender.id
            const userData = usersDB[target] || { messages: 0 }
            
            let details = ''
            const entries = Object.entries(userData).sort((a, b) => b[1] - a[1])
            
            for (const [key, val] of entries) {
                if (key === 'messages' || typeof val !== 'number') continue
                const label = TYPE_NAMES[key] || key
                if (label) details += `- ${label}: ${val}\n`
            }

            const pp = await sock.profilePictureUrl(target, 'image').catch(() => 'https://files.catbox.moe/obz4b4.jpg')
            const txt = `ⓘ *Análisis De Actividad*\n` +
                        `- Usuario: @${target.split('@')[0]}\n\n` +
                        `- *Total Mensajes:* ${userData.messages || 0}\n\n` +
                        `▢ *Desglose:*\n${details || '- Sin datos detallados.'}`

            return sock.sendMessage(m.chat.id, { image: { url: pp }, caption: txt, mentions: [target] }, { quoted: m.message })
        }

        const metadata = await sock.groupMetadata(m.chat.id)
        const participants = metadata.participants.map(p => p.id)
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id)

        const ghosts = []
        const actives = []

        participants.forEach(id => {
            const data = usersDB[id]
            const msgCount = data?.messages || 0
            if (msgCount === 0 && id !== m.bot.id) {
                ghosts.push(id)
            } else if (msgCount > 0) {
                actives.push({ id, count: msgCount })
            }
        })

        if (!subCmd || (subCmd !== 'kick')) {
            actives.sort((a, b) => b.count - a.count)
            
            const top3 = actives.slice(0, 3).map((u, i) => 
                `${i + 1}. @${u.id.split('@')[0]} (${u.count})`
            ).join('\n')

            const ghostPreview = ghosts.slice(0, 10).map(id => `  *𔓎* @${id.split('@')[0]}`).join('\n')
            const moreGhosts = ghosts.length > 10 ? `\n... y ${ghosts.length - 10} más.` : ''

            const txt = `𝄜 *Radiografía Del Grupo*\n\n` +
                        `- Total Miembros: ${participants.length}\n` +
                        `- Inactivos (0 msgs): ${ghosts.length}\n` +
                        `- Activos: ${actives.length}\n\n` +
                        `ⓘ *Top Activos:*\n${top3 || 'Nadie ha hablado aún.'}\n\n` +
                        `▢ *Lista de Fantasmas:*\n${ghostPreview || '¡Nadie! Felicidades.'}${moreGhosts}\n\n` +
                        `> Usa *.ghosts info @user* para detalles.\n` +
                        `> Usa *.ghosts kick* para eliminar inactivos.`

            return sock.sendMessage(m.chat.id, { 
                text: txt, 
                mentions: [...actives.slice(0, 3).map(u => u.id), ...ghosts.slice(0, 10)] 
            }, { quoted: m.message })
        }

        if (subCmd === 'kick') {
            if (!m.sender.role('admin', 'owner')) return m.reply('ⓘ Solo admins pueden iniciar la purga.')
            if (!m.bot.roles.admin) return m.reply('ⓘ Necesito ser Admin para eliminar gente.')

            const targets = ghosts.filter(id => !admins.includes(id))

            if (targets.length === 0) return m.reply('No hay fantasmas eliminables (los inactivos son admins o ya se fueron).')
            
            await m.reply(`ⓘ *Purga Iniciada*\nObjetivos: ${targets.length} usuarios.\n\n_Conservando administradores inactivos por seguridad..._`)

            const res = await processBatch(targets, async (id) => {
                await sock.groupParticipantsUpdate(m.chat.id, [id], 'remove')
            }, m)

            await m.reply(`✓ *Limpieza Finalizada*\n\n￬ Eliminados: ${res.ok}\n↺ Protegidos/Error: ${res.fail}`)
        }
    }
}