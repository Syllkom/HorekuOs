export default {
    command: true, usePrefix: true,
    case:['publico', 'public', 'privado', 'private'],
    description: 'Alterna entre modo público y privado, controlando quién puede ejecutar comandos del bot y restringiendo el acceso únicamente a propietarios cuando sea necesario.',
    category: 'owner',
    usage: 'public / private',
    before: true, index: 3, priority: 1,
    script: async (m, { sock, control }) => {
        if (control) {
            if (m.isCmd) {
                const settings = await global.db.open('@bot_settings')
                const isPrivate = settings.privateMode || false

                if (isPrivate && !m.sender.role('root', 'owner', 'bot')) {
                    control.end = true
                }
            }
            return
        }

        if (!m.sender.role('root', 'owner', 'bot')) return m.sms('owner')

        const settings = await global.db.open('@bot_settings')
        const isPrivateCmd =['privado', 'private'].includes(m.command)

        if (isPrivateCmd) {
            if (settings.privateMode) return m.reply('ⓘ El bot ya se encuentra en modo privado.')
            
            settings.privateMode = true
            // await m.reply('✓ *Modo Privado Activado*\nⓘ Ahora solo los propietarios y administradores del sistema pueden utilizar mis comandos.')
        } else {
            if (!settings.privateMode) return m.reply('ⓘ El bot ya se encuentra en modo público.')
            
            settings.privateMode = false
            await m.reply('✓ *Modo Público Activado*\nⓘ Todos los usuarios de los grupos e internos pueden utilizar mis comandos.')
        }
        
        await m.react('done')
    }
}