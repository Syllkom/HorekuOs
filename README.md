▢ Aethero

● Sinopsis
Aethero es un agente avanzado de WhatsApp diseñado para producción, construido sobre la arquitectura de HorekuOs Engine. Esta rama está dedicada exclusivamente a albergar las configuraciones específicas, personalizaciones de comandos y la suite de plugins que definen el comportamiento de Aethero, manteniendo el núcleo del sistema desacoplado en la rama principal.

Para detalles sobre el funcionamiento de la base de datos (Hyper-DB v3), el ciclo de vida del Engine o la lógica del pipeline, consulte la documentación oficial en la rama main de HorekuOs.

● Configuración Predeterminada
Aethero viene listo para desplegarse de manera limpia con los siguientes parámetros globales configurados en `config.js`:

```javascript
global.config = {
    name: "Aethero",
    prefixes: ".¿?¡!#%&/,~@",
    saveHistory: true,
    autoRead: false,
    silentConsole: true,
    iconAI: false
}
```

● Plugins Personalizados (Suite Aethero)
Esta rama incluye una selección de plugins optimizados para el uso diario y la moderación, construidos de forma nativa sobre el Engine:

- set (grupo / config)
  Unifica toda la configuración del bot y del grupo en un único comando maestro mediante subcomandos inteligentes (.set welcome on / .set antilink off). Permite personalizar los mensajes de bienvenida y apagar categorías completas.

- whois (stalk / perfil)
  Analizador de perfiles de WhatsApp que extrae la bio, roles, estadísticas de mensajes en el grupo y la foto de perfil en alta resolución. Cuenta con un sistema interno de timeout de 3 segundos para evitar que el bot se cuelgue ante perfiles privados.

- vv (viewonce)
  Extractor sigiloso de contenido multimedia configurado como "Ver una vez". Permite la revelación mediante comandos tradicionales o mediante reacciones cautelosas (👀/👁️) exclusivas para los propietarios del bot.

- shell (>)
  Herramientas de desarrollo nativas para el root y owner, permitiendo la ejecución de código en caliente o comandos del sistema operativo de manera inmediata.

● Despliegue e Instalación
Para iniciar la instancia de Aethero en producción:

1. Clonar esta rama especializada:
```bash
git clone -b aethero https://github.com/Syllkom/HorekuOs
cd HorekuOs
```

2. Instalar dependencias e iniciar el asistente CLI:
```bash
npm install
npm start
```

3. Vincular el bot seleccionando el método interactivo (Código QR o Código PIN de 8 dígitos) que se desplegará en la consola.
```

¿Qué te parece pa? Quedó súper enfocado en la instancia final y mantiene tu documentación de la base limpia en la rama principal como debe ser.