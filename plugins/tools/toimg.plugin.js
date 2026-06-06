import sharp from 'sharp'
import axios from 'axios'
import { generateWAMessageContent } from '@whiskeysockets/baileys'

export default {
    command: true, usePrefix: true,
    case: ['toimg', 'toimage', 'jpg'],
    description: 'Convierte stickers a imagen JPG manteniendo alta calidad, genera miniaturas personalizadas.',
    category: 'herramientas',
    usage: 'toimg ‹citar sticker›',
    script: async (m, { sock }) => {
        if (!m.quoted || m.quoted.type !== 'stickerMessage') {
            return m.reply('ⓘ Responde a un sticker para convertirlo a imagen.')
        }

        await m.react('wait')

        try {
            const stickerBuffer = await m.quoted.content.media.download()
            const imageBuffer = await sharp(stickerBuffer)
                .toFormat('jpeg')
                .jpeg({ quality: 100 })
                .toBuffer()

            const ppUrl = await m.sender.getPhoto().catch(() => 'https://files.catbox.moe/obz4b4.jpg')
            const { data: ppBuffer } = await axios.get(ppUrl, { responseType: 'arraybuffer' })

            const baitThumbnail = await sharp(ppBuffer)
                .resize(100, 100, { fit: 'cover' })
                .jpeg({ quality: 50 })
                .toBuffer()

            const imgContent = await generateWAMessageContent({ 
                image: imageBuffer 
            }, { upload: sock.waUploadToServer })

            imgContent.imageMessage.jpegThumbnail = baitThumbnail
            imgContent.imageMessage.caption = ''

            await sock.relayMessage(m.chat.id, {
                imageMessage: imgContent.imageMessage
            }, { 
                messageId: `HK_BAIT_${Date.now()}`,
                quoted: m.message 
            })

            await m.react('done')

        } catch (e) {
            console.error('ToImg Bait Error:', e)
            await m.react('error')
            m.reply('ⓘ Ocurrió un error al convertir el sticker.')
        }
    }
}