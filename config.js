import { color } from './library/utils/CacheUtils.js'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

global.font = {
    NunitoSans: { Bold: 'https://tinyurl.com/NunitoSans-Bold' },
    NotoSans: { Bold: 'https://tinyurl.com/NotoSans-Bold' },
    Anton: { Regular: 'https://tinyurl.com/Anton-Regular' },
    MonoSpace: { Regular: 'https://tinyurl.com/SpaceMono' }
}

global.readMore = String
    .fromCharCode(8206)
    .repeat(850)


global.config = {
    name: "HorekuOs",
    prefixes: ".¿?¡!#%&/,~@",
    saveHistory: true,
    autoRead: false,
    silentConsole: true,
    iconAI: true // para ver el icono de IA en chats privados
}

/*
global.config.telegramProxy = {
    enabled: false,
    apiId: 1234567, // my.telegram.org
    apiHash: "tu_hash_aqui",
    sessionString: ""
}
*/

global.config.userRoles = {
    "36082607472889@lid": {
        root: true,
        owner: true,
        mod: true,
        vip: true
    }
}

global.REACT_EMOJIS = {
    wait: "⌛",
    done: "✔️",
    error: "✖️"
}

global.MSG = {
    root: 'Este comando solo puede ser utilizado por el *dueño*',
    owner: 'Este comando solo puede ser utilizado por un *propietario*',
    mod: 'Este comando solo puede ser utilizado por un *moderador*',
    vip: 'Esta solicitud es solo para usuarios *premium*',
    group: 'Este comando solo se puede usar en *grupos*',
    private: 'Este comando solo se puede usar por *chat privado*',
    admin: 'Este comando solo puede ser usado por los *administradores del grupo*',
    botAdmin: 'El bot necesita *ser administrador* para usar este comando',
    unreg: 'Regístrese para usar esta función escribiendo:\n\n.registrar nombre.edad',
    restrict: 'Esta función está desactivada'
}


global.PLUGINS_MSG = {
    newPlugin: `${color.bg.rgb(119, 205, 255)}${color.rgb(0, 0, 0)}Nuevo plugin: ${color.rgb(255, 255, 255)}${color.reset}`,
    updatedPlugin: `${color.bg.rgb(239, 250, 142)}${color.rgb(0, 0, 0)}Recargando plugin: ${color.rgb(255, 255, 255)}${color.reset}`,
    deletedPlugin: `${color.bg.rgb(241, 114, 114)}${color.rgb(0, 0, 0)}Plugin eliminado: ${color.rgb(255, 255, 255)}${color.reset}`
}

global.SCRAPERS_MSG = {
    newScraper: `${color.bg.rgb(255, 165, 0)}${color.rgb(0, 0, 0)}Nuevo scraper: ${color.rgb(255, 255, 255)}${color.reset}`,
    updatedScraper: `${color.bg.rgb(255, 215, 0)}${color.rgb(0, 0, 0)}Recargando scraper: ${color.rgb(255, 255, 255)}${color.reset}`,
    deletedScraper: `${color.bg.rgb(220, 20, 60)}${color.rgb(0, 0, 0)}Scraper eliminado: ${color.rgb(255, 255, 255)}${color.reset}`
}