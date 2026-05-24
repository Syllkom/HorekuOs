const fs = require('fs')
const path = require('path')

const outputFileName = 'proyecto_completo.txt'
// Añadida consistencia para ignorar archivos de salida comunes y el propio script
const ignoreDirs = ['node_modules', '.git', '.idx', '.next', '.firebase', '.gitignore', 'dist', '.astro']
const validExtensions = ['.js', '.jsx', '.mjs', '.astro', '.json', '.txt', '.ts', '.html', '.css', '.tsx'] 

const currentDate = new Date().toLocaleString('en-US')
const folderName = path.basename(process.cwd())

let output = `Fecha: ${currentDate}\nCarpeta: ${folderName}\n\n====================\n\n${folderName}/\n`

function getTree(dir, prefix = '') {
    let treeStr = ''
    // Filtrado base integrado para no repetir lógica
    const items = fs.readdirSync(dir).filter(f => !ignoreDirs.includes(f) && f !== outputFileName && f !== 'generar.cjs')

    // Mapeamos primero los elementos con su estado para no saturar el disco con fs.statSync en el sort
    const itemsWithStat = items.map(item => {
        const itemPath = path.join(dir, item)
        return { item, isDirectory: fs.statSync(itemPath).isDirectory(), itemPath }
    })

    itemsWithStat.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.item.localeCompare(b.item)
    })

    itemsWithStat.forEach((fileObj, index) => {
        const isLast = index === itemsWithStat.length - 1
        treeStr += `${prefix}${isLast ? '└── ' : '├── '}${fileObj.item}\n`

        if (fileObj.isDirectory) {
            treeStr += getTree(fileObj.itemPath, prefix + (isLast ? '    ' : '│   '))
        }
    })
    return treeStr
}

output += getTree('.')
output += `\n====================\n\n`

function getFiles(dir) {
    let filePaths = []
    const items = fs.readdirSync(dir).filter(f => !ignoreDirs.includes(f) && f !== outputFileName && f !== 'generar.cjs')

    for (const item of items) {
        const itemPath = path.join(dir, item)
        if (fs.statSync(itemPath).isDirectory()) {
            filePaths = filePaths.concat(getFiles(itemPath))
        } else {
            const ext = path.extname(item)
            if (validExtensions.includes(ext) || item === '.gitignore') {
                filePaths.push(itemPath)
            }
        }
    }
    return filePaths
}

const allFiles = getFiles('.')

for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split(/\r?\n/)
    
    // SOLUCIÓN: Usamos path.relative para obtener algo como "src/components/Button.jsx"
    // Reemplazamos los separadores de Windows (\) por (/) para mantener consistencia Unix
    const relativePath = path.relative('.', filePath).replace(/\\/g, '/')

    output += `// ./${relativePath}\n\n---\n\n`
    lines.forEach((line, index) => {
        output += `${index + 1} | ${line}\n`
    })
    output += `\n---\n\n`
}

fs.writeFileSync(outputFileName, output)
console.log(`¡Archivo generado exitosamente: ${outputFileName}!`)
