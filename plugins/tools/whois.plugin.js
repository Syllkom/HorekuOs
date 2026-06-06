export default {
    command: true, usePrefix: true,
    case: ['whois', 'stalk'],
    description: 'Muestra la información técnica, roles, estadísticas de grupo y foto de perfil de un usuario.',
    category: 'herramientas',
    usage: ['whois @user', 'whois (citado)'],
    script: async (m, { sock }) => {
        let targetId = m.sender.mentioned[0] || m.quoted?.sender?.id
        
        if (!targetId) {
            targetId = m.sender.id
        }

        await m.react('wait')

        const users = await global.db.open('@users')
        const dbUser = users[targetId] || {}
        
        const name = dbUser.name || m.quoted?.sender?.name || (targetId === m.sender.id ? m.sender.name : 'Desconocido')
        
        let desc = 'Sin descripción'
        try {
            desc = await m.cache.sender.desc(targetId)
        } catch (e) {}

        const configRoles = global.config.userRoles[targetId] || global.config.userRoles[targetId.split('@')[0]] || {}
        const dbRoles = dbUser.roles || {}
        const roles = { ...dbRoles, ...configRoles }

        const rootStatus = roles.root ? '✓' : '✗'
        const ownerStatus = roles.owner ? '✓' : '✗'
        const modStatus = roles.mod ? '✓' : '✗'
        const vipStatus = roles.vip ? '✓' : '✗'
        const banStatus = dbUser.banned ? '✓' : '✗'

        let text = '```╭○ Perfil / User\n'
        text += `╵ Nombre: ${name}\n`
        text += `╵ Número: ${targetId.split('@')[0]}\n`
        text += `╵ JID: ${targetId}\n`
        text += `╵ Estado: ${desc}\n`
        text += '╰╶╴──────╶╴─╶╴◯\n\n'
        text += '╭○ Roles y Seguridad\n'
        text += `╵ Root:        ${rootStatus}\n`
        text += `╵ Propietario: ${ownerStatus}\n`
        text += `╵ Moderador:   ${modStatus}\n`
        text += `╵ Premium:     ${vipStatus}\n`
        text += `╵ Baneado:     ${banStatus}\n`
        text += '╰╶╴──────╶╴─╶╴◯```'

        if (m.chat.isGroup) {
            try {
                const chatDb = await m.chat.db()
                const groupUser = chatDb.users?.[targetId]
                if (groupUser) {
                    text += `\n\n▢ Estadísticas en Grupo\n`
                    text += `- Mensajes: ${groupUser.messages || 0}\n`
                }
            } catch (e) {}
        }

        try {
            await sock.sendMessage(m.chat.id, { 
                image: { url: await m.cache.sender.photo(targetId, 'image') }, 
                caption: text, 
                mentions: [targetId] 
            }, { quoted: m.message })
            
            await m.react('done')
        } catch (err) {
            await m.react('error')
            await m.reply('ⓘ Ocurrió un error al procesar la información del usuario.')
        }
    }
}