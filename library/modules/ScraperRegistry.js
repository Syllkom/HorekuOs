import path from "path"
import { pathToFileURL } from 'url'
import { watch } from 'chokidar'
import logger from "../utils/Logger.js"

export class ScraperRegistry {
    constructor(folderPath) {
        this.folder = path.resolve(folderPath)
        this.registry = new Map()

        global.scra = {
            dl: async (fileName) => await this.getScraper('downloader', fileName),
            tools: async (fileName) => await this.getScraper('tools', fileName),
            search: async (fileName) => await this.getScraper('search', fileName),
            stalk: async (fileName) => await this.getScraper('stalk', fileName)
        }
    }

    async getScraper(category, fileName) {
        const relPath = path.join(category, fileName).replace(/\\/g, '/')
        
        if (this.registry.has(relPath)) {
            return this.registry.get(relPath)
        }
        
        return await this.loadFile(relPath)
    }

    remove(relPath) {
        return this.registry.delete(relPath.replace(/\\/g, '/'))
    }

    load() {
        return new Promise((resolve, reject) => {
            this.watcher = watch(this.folder, {
                persistent: true,
                ignoreInitial: false,
                depth: 99
            })

            this.watcher.on('add', (filePath) => {
                const relPath = path.relative(this.folder, filePath).replace(/\\/g, '/')
                console.log(global.SCRAPERS_MSG.newScraper, relPath)
                this.loadFile(relPath)
            })

            this.watcher.on('change', (filePath) => {
                const relPath = path.relative(this.folder, filePath).replace(/\\/g, '/')
                console.log(global.SCRAPERS_MSG.updatedScraper, relPath)
                this.remove(relPath)
                setTimeout(() => this.loadFile(relPath), 1000)
            })

            this.watcher.on('unlink', (filePath) => {
                const relPath = path.relative(this.folder, filePath).replace(/\\/g, '/')
                console.log(global.SCRAPERS_MSG.deletedScraper, relPath)
                this.remove(relPath)
            })

            this.watcher.on('error', (e) => {
                logger.error("Watcher Scrapers Error:", e)
                reject(e)
            }).on('ready', () => { resolve(); });
        })
    }

    async loadFile(relPath) {
        if (!relPath.endsWith('.js')) return

        const absPath = path.join(this.folder, relPath)
        const fileURL = pathToFileURL(absPath).href
        const versionedURL = `${fileURL}?update=${Date.now()}`

        try {
            const mod = await import(versionedURL)
            this.registry.set(relPath.replace(/\\/g, '/'), mod)
            return mod
        } catch (e) {
            if (e.code === 'ERR_UNSUPPORTED_DIR_IMPORT') return
            logger.error(`Error cargando scraper (${relPath}):`, e)
        }
    }
}