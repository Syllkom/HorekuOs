import logger from '../../library/utils/Logger.js'

export default async function ({ m, sock, message }) {
    try {
        m.db = async (id) => {
            if (id.endsWith('@g.us')) {
                return await global.db.open('@chat:' + id)
            } 
            else if (id.endsWith('@lid')) {
                const users = await global.db.open('@users')
                
                if (!users[id]) {
                    users[id] = {
                        name: '',
                        banned: false,
                        roles: {}
                    }
                }
                return users[id]
            }
        }
        
        m.reply = async (text, options = {}) => {
            try {
                await sock.sendPresenceUpdate('composing', m.chat.id)

                const textLength = typeof text === 'string' ? text.length : (text.text ? text.text.length : 15)
                const typingDelay = Math.min(textLength * 30, 3000) + Math.floor(Math.random() * 500)
                
                await new Promise(resolve => setTimeout(resolve, typingDelay))
                
                await sock.sendPresenceUpdate('paused', m.chat.id)

                const quotedObj = (message && !message.messageStubType) ? { quoted: message } : {}
                const finalOptions = { ...quotedObj, ...options }

                if (typeof text === 'string') {
                    const mentionedJid = (text.match(/@(\d{0,16})/g) ||[]).map(v => v.slice(1) + '@lid')
                    return await sock.sendMessage(m.chat.id, { text: text, contextInfo: { mentionedJid } }, finalOptions)
                } else if (typeof text === 'object') {
                    return await sock.sendMessage(m.chat.id, text, finalOptions)
                } else {
                    return new Error('[E]: m.reply(string | object)')
                }
            } catch (e) {
                console.error('[m.reply Error]:', e)
            }
        }
        
        /*m.reply = async (text, footer = '@' + 'HorekuOs') => {
            if (typeof text === 'string') {
                const mentionedJid = (text.match(/@(\d{0,16})/g) ||[]).map(v => v.slice(1) + '@lid')
                
                const msgContent = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: { 
                                deviceListMetadata: {}, 
                                deviceListMetadataVersion: 2 
                            },
                            interactiveMessage: {
                                header: { title: '', hasMediaAttachment: false },
                                body: { text: text },
                                footer: { text: footer },
                                contextInfo: { mentionedJid: mentionedJid },
                                carouselMessage: { cards:[] } 
                            }
                        }
                    }
                }

                return sock.relayMessage(m.chat.id, msgContent, (message && !message.messageStubType) ? { quoted: message } : {})

            } else if (typeof text === 'object') {
                return sock.sendMessage(m.chat.id, text, (message && !message.messageStubType) ? { quoted: message } : {})
            } else {
                return new Error('[E]: m.reply(string ?)')
            }
        }*/

        m.setBan = async (id, state = true) => {
            if (!id) return
            if (!id.endsWith('@g.us') && !id.endsWith('@lid')) return
            
            const targetDB = await m.db(id)
            
            targetDB.banned = state
        }

        m.setRole = async (id, state, ...roles) => {
            if (!id || !roles.length) return
            if (!id.endsWith('@lid')) return
            
            const targetDB = await m.db(id)
            if (!targetDB.roles) targetDB.roles = {}
            
            for (const role of roles) {
                targetDB.roles[role] = state
            }
            return true
        }

        m.react = async (text) => {
            if (!text) return
            if (typeof text !== 'string') return
            const react = global.REACT_EMOJIS[text]
            return sock.sendMessage(m.chat.id, {
                react: {
                    text: react ?? text,
                    key: message.key
                }
            })
        }

        m.sms = (type) => {
            let msg = global.MSG[type]
            if (!msg) return
            return m.reply(msg)
        }
        
        m.getQuotedText = () => {
            if (!m.quoted) return ''
            
            if (m.quoted.content?.text) return m.quoted.content.text
            if (m.quoted.body) return m.quoted.body
            
            const qMsg = m.quoted.message
            if (!qMsg) return ''

            const realMsg = qMsg.message || qMsg

            return realMsg.conversation || 
                   realMsg.extendedTextMessage?.text || 
                   realMsg.imageMessage?.caption || 
                   realMsg.videoMessage?.caption || 
                   ''
        }

        m.getQuotedMedia = async () => {
            if (!m.quoted || !m.quoted.content?.media) return null
            try {
                return await m.quoted.content.media.download()
            } catch (e) {
                logger.error('Error descargando media citada:', e.message)
                return null
            }
        }
        
    } catch (e) { logger.error(e) }
}