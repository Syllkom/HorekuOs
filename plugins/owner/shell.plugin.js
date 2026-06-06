import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

export default {
    command: true, usePrefix: false,
    case: ['>', '=>', '$'],
    description: 'Ejecuta código asíncrono (JavaScript) y comandos de consola (Shell).',
    category: 'owner',
    usage: ['> ‹script›', '=> ‹return script›', '$ ‹shell›'],
    script: async (m, { sock, store, plugin }) => {
        if (!m.sender.role('root', 'owner')) return

        try {
            if (m.body.startsWith('=>') || m.body.startsWith('>')) {
                await m.react('wait')

                const isAutoReturn = m.body.startsWith('=>')
                const codeRaw = m.body.slice(isAutoReturn ? 2 : 1).trim()
                const code = `return (${codeRaw})`

                const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
                const print = (...args) => m.reply(util.format(...args))

                const execCode = new AsyncFunction(
                    'm', 'sock', 'store', 'plugin', 'global', 'print', 'db',
                    code
                )

                let result = await execCode(m, sock, store, plugin, global, print, global.db)

                if (typeof result !== 'undefined') {
                    if (typeof result !== 'string') result = util.inspect(result, { depth: 2 })
                    await m.reply(result)
                }

                await m.react('done')
            }
            else if (m.body.startsWith('$')) {
                await m.react('wait')
                const shellCommand = m.body.slice(1).trim()
                const { stdout, stderr } = await execPromise(shellCommand)
                const response = stdout || stderr || 'No output'
                await m.reply(response.trim())
                await m.react('done')
            }
        } catch (err) {
            await m.react('error')
            await m.reply(`ⓘ *Excepción atrapada:*\n\n${String(err)}`)
        }
    }
}
