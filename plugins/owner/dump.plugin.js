export default {
    command: true, usePrefix: true,
    case: ['dump', 'json'],
    description: 'Inspecciona mensajes citados mostrando su estructura JSON completa, genera código listo para retransmitir el payload y permite reenviar el contenido original para pruebas o depuración avanzada. ',
    category: 'owner',
    usage: 'dump ‹citar›',
    script: async (m, { sock }) => {
        if (!m.sender.role('root', 'owner')) return
        if (!m.quoted) return m.reply('ⓘ Cita el mensaje que quieres destripar.')
        
        await m.react('wait')

        try {
            const rawMessage = JSON.stringify(m.quoted.message, null, 2)
            const jsonBuffer = Buffer.from(rawMessage, 'utf-8')
            const relayCode = `const payload = ${rawMessage}\n\nawait sock.relayMessage(m.chat.id, payload, { messageId: 'HK_DUMP_' + Date.now() })`

            const msg = await sock.sendMessage(m.chat.id, {
                interactiveMenu: {
                    document: jsonBuffer,
                    fileName: `Dump_${Date.now()}.json`,
                    mimetype: 'application/json',
                    
                    body: "Dump",
                    footer: "HorekuOs Advanced Engine",
                    
                    buttons:[
                        { type: 'copy', text: 'Copiar JSON', payload: rawMessage },
                        { type: 'copy', text: 'Copiar Relay Code', payload: relayCode },
                        { type: 'reply', text: 'Ejecutar Payload', id: 'exec_dump' }
                    ]
                }
            }, { quoted: m.message })

            await m.react('done')

            await sock.setReplyHandler(msg, {
                security: { 
                    userId: m.sender.id,
                    chatId: m.chat.id, 
                    scope: 'all' 
                },
                lifecycle: { consumeOnce: false },
                state: { 
                    payload: m.quoted.message
                },
                routes:[
                    {
                        priority: 1,
                        code: {
                            guard: (m_e) => m_e.body !== 'exec_dump',
                            
                            executor: async (m_e, ctx) => {
                                await ctx.sock.relayMessage(m_e.chat.id, ctx.state.payload, { 
                                    messageId: 'HK_EXEC_' + Date.now() 
                                })
                                await m_e.reply('✓ Payload inyectado con éxito.')
                            }
                        }
                    }
                ]
            }, 1000 * 60 * 15)

        } catch (e) {
            console.error('Dump Error:', e)
            await m.react('error')
            m.reply(`ⓘ Error al extraer el objeto: ${e.message}`)
        }
    }
}