export default {
    before: true,
    index: 3,
    priority: 5,
    script: async (m, { control }) => {
        if (!m.isCmd || !m.chat.isGroup) return
        const dbTarget = await m.chat.db()
        if (dbTarget?.settings?.bot === false) {
        
            const isAdmin = m.sender.roles.admin
            const isSuperAdmin = m.sender.role('root', 'owner', 'bot')
            
            if (!isAdmin && !isSuperAdmin) {
                control.end = true
            }
        }
    }
}