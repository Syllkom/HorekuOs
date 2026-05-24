const $db = global.db
const userRoles = global.config.userRoles

export default async ({ m, cached, message, contextInfo }) => {
    m.sender = m.sender || {}
    m.sender.roles = {}
    
    if (m.bot.fromMe) {
        m.sender.id = m.bot.id
    } 
    else if (m.chat.isGroup) {
        const p = message.key.participant
        const pAlt = message.key.participantAlt
        
        if (p?.endsWith('@lid')) m.sender.id = p
        else if (pAlt?.endsWith('@lid')) m.sender.id = pAlt
        else m.sender.id = p || pAlt
    } 
    else {
        const r = message.key.remoteJid
        const rAlt = message.key.remoteJidAlt
        
        if (r?.endsWith('@lid')) m.sender.id = r
        else m.sender.id = r
    }

    if (m.sender.id && m.sender.id.includes(':')) {
        m.sender.id = m.sender.id.split(':')[0] + '@' + m.sender.id.split('@')[1]
    }

    m.sender.name = m.bot.fromMe ? m.bot.name : message.pushName || 'Usuario'
    m.sender.number = m.sender.id ? m.sender.id.split('@')[0] : undefined 
    m.sender.user = '@' + m.sender.number
    m.sender.getDesc = async () => await cached.sender.desc(m.sender.id)
    m.sender.getPhoto = async () => await cached.sender.photo(m.sender.id, 'image')
    m.sender.role = (...array) => array.some(role => m.sender.roles[role] === true)
    m.sender.mentioned = contextInfo.mentionedJid ?? []

    m.sender.db = async () => {
        const users = await $db.open('@users')
        if (!users[m.sender.id]) {
            users[m.sender.id] = {
                name: m.sender.name,
                banned: false,
                roles: {}
            }
        }
        return users[m.sender.id]
    }

    const usersDB = await $db.open('@users')
    
    if (!usersDB[m.sender.id]) {
        usersDB[m.sender.id] = {
            name: m.sender.name,
            banned: false,
            roles: { root: false, owner: false, mod: false, vip: false }
        }
    }

    const userData = usersDB[m.sender.id]

    if (m.bot.id === m.sender.id) {
        m.sender.roles.bot = true
        Object.assign(m.sender.roles, { root: true, owner: true, mod: true, vip: true })
    } else {
        const configRoles = userRoles[m.sender.id] || userRoles[m.sender.number]

        if (configRoles) {
            userData.roles = { ...userData.roles, ...configRoles }
        }
        Object.assign(m.sender.roles, userData.roles)
    }

    try {
        if (m.chat.isGroup) {
            const chat = await m.chat.db()
            
            if (!chat.users) chat.users = {}
            if (!chat.users[m.sender.id]) chat.users[m.sender.id] = { messages: 0 }
            
            chat.users[m.sender.id].messages += 1
            
            const type = Object.keys(message.message || {})[0]
            if (type) {
                if (!chat.users[m.sender.id][type]) chat.users[m.sender.id][type] = 0
                chat.users[m.sender.id][type] += 1
            }
        }
    } catch (e) { console.error('Error stats:', e) }

    try {
        if (m.message?.message && global.config.saveHistory && m.chat.isGroup) {
            const chatHistory = await global.db.open('@history/' + m.chat.id)
            chatHistory[m.id] = m.sender.id

            const senderHistory = await global.db.open('@history/' + m.chat.id + '/' + m.sender.id)
            
            if (!Array.isArray(senderHistory.data)) senderHistory.data = []
            
            senderHistory.data.push(JSON.parse(JSON.stringify(m.message)))

            if (senderHistory.data.length > 50) {
                const objeto = senderHistory.data.shift()
                if (objeto?.key?.id) delete chatHistory[objeto.key.id]
            }
        }
    } catch (e) { console.error('Error history:', e) }
}