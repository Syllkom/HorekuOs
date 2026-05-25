
# HorekuOs

Framework modular de alto rendimiento para automatización de WhatsApp.

HorekuOs es un motor de automatización construido sobre @whiskysockets/baileys, diseñado para ser escalable, rápido y fácil de extender mediante un sistema de plugins dinámico.

---

## Características Principales

- Arquitectura Event-Driven: Procesamiento eficiente basado en eventos.
- Process Isolation: Uso de child_process.fork() para mayor estabilidad del núcleo.
- Plugin System: Soporte de hot-reload nativo mediante chokidar.
- Persistencia: Integración optimizada con HyperDB para gestión de datos.
- ESM Nativo: Desarrollado completamente bajo estándares modernos de Node.js.
- Altamente Modular: Fácil de mantener y extender.

---

## Instalación

```bash
git clone https://github.com/Syllkom/HorekuOs.git
cd HorekuOs
npm install
```

---

## Inicio Rápido

```bash
npm start
```

Para desarrollo:

```bash
npm run dev
```

---

## Documentación Completa

La guía detallada de instalación, configuración y creación de plugins se encuentra en el sitio oficial:

https://horekuos.vercel.app/docs

---

## Tecnologías Utilizadas

- Node.js
- @whiskysockets/baileys
- HyperDB
- Chokidar
- Arquitectura basada en eventos y plugins

---

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

---

## Autor

Desarrollado por Syllkom

---
