import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

export const buildRichResponse = async (sock, jid, data, options) => {
    const { randomUUID } = await import('crypto')
    const submessages = []
    const sections = []
    const sources = []
    const inlineEntities =[]

    if (data.links && data.links.length > 0) {
        let linksText = "\n\n"
        const searchSources = []
        const superscript =['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']

        data.links.forEach((link, idx) => {
            const urlObj = new URL(link.url)
            const hostname = urlObj.hostname
            const favicon = link.favicon || `https://external-content.duckduckgo.com/ip3/${hostname}.ico`
            
            linksText += `{{IE_${idx}}}${superscript[idx] || ''}{{/IE_${idx}}} ${link.title}\n`
            
            sources.push({
                provider: "BING",
                thumbnailCdnUrl: link.thumbnail || "",
                sourceProviderUrl: link.url, sourceQuery: "",
                faviconCdnUrl: favicon,
                citationNumber: idx + 1,
                sourceTitle: link.title
            })

            inlineEntities.push({
                key: `IE_${idx}`,
                metadata: {
                    reference_id: idx + 1,
                    reference_url: link.url,
                    reference_title: link.title,
                    reference_display_name: hostname,
                    sources:[{ source_type: "THIRD_PARTY",
                        source_display_name: hostname,
                        source_subtitle: "",
                        source_url: link.url }],
                    __typename: "GenAISearchCitationItem"
                }
            })

            searchSources.push({
                source_type: "THIRD_PARTY",
                source_display_name: link.title,
                source_subtitle: hostname,
                source_url: link.url,
                favicon: {
                    url: favicon,
                    mime_type: "image/x-icon",
                    width: 16,
                    height: 16 }
                }
            )
        })

        if (data.text) data.text += linksText.trimEnd(); else data.text = linksText.trim()

        sections.push({ view_model: { primitive: { sources: searchSources, search_engine: "BING", facepile_favicons:[], __typename: "GenAISearchResultPrimitive" }, __typename: "GenAISingleLayoutViewModel" } })
    }

    if (data.text) {
        submessages.push({
            messageType: "AI_RICH_RESPONSE_TEXT",
            messageText: data.text })
        sections.unshift({
            view_model: {
                primitive: {
                    text: data.text, ...(inlineEntities.length > 0 ? { inline_entities: inlineEntities } : {}), __typename: "GenAIMarkdownTextUXPrimitive" },
                    __typename: "GenAISingleLayoutViewModel" }
                }
            )
    }

    if (data.table) {
        const tableRows =[{ items:
            data.table.headers,
            isHeading: true },
            ...data.table.rows.map(row => ({ items: row.map(String) }))]
        submessages.push({
            messageType: 4,
            tableMetadata: { title:
                data.table.title || "Datos",
                rows: tableRows }
            }
        )
    }

    if (data.code) {
        const tokenizer = (codeStr) => {
            const tokens =[]; let i = 0; const len = codeStr.length
            const keywords = new Set(['break','case','catch','continue','debugger','default','delete','do','else','finally','for','function','if','in','instanceof','new','return','switch','this','throw','try','typeof','var','void','while','with','true','false','null','undefined','NaN','Infinity','class','const','let','super','extends','export','import','yield','static','constructor','of','async','await','get','set','=>'])
            const push = (content, type) => tokens.push({ content, type })

            while (i < len) {
                const ch = codeStr[i]; const next = codeStr[i + 1]
                if (/\s/.test(ch)) { let s = i; while (i < len && /\s/.test(codeStr[i])) i++; push(codeStr.slice(s, i), 'DEFAULT'); continue; }
                if (ch === '/' && (next === '/' || next === '*')) {
                    let s = i; if (next === '/') { i += 2
                        while (i < len && codeStr[i] !== '\n') i++; }
                        else { i += 2; while (i < len && !(codeStr[i] === '*' && codeStr[i + 1] === '/')) i++; i = Math.min(len, i + 2); }
                    push(codeStr.slice(s, i), 'COMMENT')
                    continue
                }
                if (ch === '"' || ch === "'" || ch === '`') {
                    let s = i; const quote = ch; i++
                    while (i < len) { if (codeStr[i] === '\\') { i += 2
                        continue } if (codeStr[i] === quote) { i++
                            break } i++ }
                    push(codeStr.slice(s, i), 'STR')
                    continue
                }
                if (/[0-9]/.test(ch)) { let s = i; while (i < len && /[0-9._xobA-Fa-f]/.test(codeStr[i])) i++; push(codeStr.slice(s, i), 'NUMBER'); continue; }
                if (/[+\-*/%=<>!&|^~?:;.,[\]{}]/.test(ch)) { let s = i; if ((ch === '=' && next === '>') || (ch === '=' && next === '=')) { i += 2; } else { i++; } push(codeStr.slice(s, i), 'SYMBOL'); continue; }
                if (/[a-zA-Z_$]/.test(ch)) {
                    let s = i
                    while (i < len && /[a-zA-Z0-9_$]/.test(codeStr[i])) i++
                    const word = codeStr.slice(s, i)
                    if (keywords.has(word)) { push(word, 'KEYWORD'); } else { let j = i
                        while (j < len && /\s/.test(codeStr[j])) j++
                        ush(word, (j < len && codeStr[j] === '(') ? 'METHOD' : 'VARIABLE') }
                    continue
                }
                push(ch, 'DEFAULT'); i++
            }
            return tokens
        }

        const rawTokens = tokenizer(data.code.code)
        const typeToHighlight = {
            KEYWORD: 1,
            METHOD: 2,
            VARIABLE: 2,
            STR: 3,
            COMMENT: 3,
            NUMBER: 4,
            SYMBOL: 4,
            DEFAULT: 1
        }
        const neonTokens = rawTokens.map(t => ({
            content: t.content,
            type: (t.type === 'SYMBOL' || t.type === 'NUMBER') ? 'NUMBER' : (t.type === 'VARIABLE' || t.type === 'METHOD') ? 'METHOD' : (t.type === 'COMMENT' || t.type === 'STR') ? 'STR' : 'KEYWORD' 
        }))
        const protoBlocks = rawTokens.map(t => ({
            codeContent: t.content,
            highlightType: typeToHighlight[t.type] || 1
        }))

        submessages.push({
            messageType: 5,
            codeMetadata: {
                codeLanguage: data.code.language || "javascript",
                codeBlocks: protoBlocks }
            }
        )
        sections.push({ view_model:
            { primitive:
                { language: data.code.language || "javascript",
                    code_blocks: neonTokens,
                    __typename: "GenAICodeUXPrimitive" },
                    __typename: "GenAISingleLayoutViewModel"
                }
            }
        )
    }

    if (data.reels && data.reels.length > 0) {
        const normalize = (item = {}) => {
            const creator = item.creator || item.title || "Reel"
            return {
                title: item.title || creator,
                creator: creator,
                verified: !!item.verified,
                profileIconUrl: item.profileIconUrl || "https://files.catbox.moe/obz4b4.jpg",
                thumbnailUrl: item.thumbnailUrl || "https://files.catbox.moe/obz4b4.jpg",
                videoUrl: item.videoUrl || ""
            }
        }
        const reels = data.reels.map(normalize)

        submessages.push({
            messageType: 9,
            contentItemsMetadata: {
                contentType: "CAROUSEL",
                itemsMetadata: reels.map(item => ({
                    reelItem: {
                        title: item.title + (item.verified ? " (verificado)" : ""),
                        profileIconUrl: item.profileIconUrl,
                        thumbnailUrl: item.thumbnailUrl,
                        videoUrl: item.videoUrl,
                        creator: item.creator,
                        isVerified: item.verified
                    }
                }
            ))
        } })
        sections.splice(1, 0, {
            view_model: {
                primitives: reels.map(item => ({
                    reels_url: item.videoUrl,
                    thumbnail_url: item.thumbnailUrl,
                    creator: item.creator + (item.verified ? " (verificado)" : ""),
                    avatar_url: item.profileIconUrl,
                    reels_title: item.title,
                    reel_source: "IG", is_verified: true,
                    creator_verified: item.verified,
                    __typename: "GenAIReelPrimitive" })),
                    __typename: "GenAIHScrollLayoutViewModel"
                }
            }
        )
    }

    const unifiedResponseData = {
        response_id: randomUUID(),
        sections: sections
    }

    let ctxInfo = {
        mentionedJid: options.mentions ||[],
        remoteJid: jid
    }
    if (options.quoted) {
        const q = options.quoted
        ctxInfo.stanzaId = q.key.id
        ctxInfo.participant = q.key.participant || q.key.remoteJid
        ctxInfo.quotedMessage = q.message
    }

    const message = {
        messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            botMetadata: {
                pluginMetadata: {},
                ...(sources.length > 0 ? { richResponseSourcesMetadata: { sources } } : {})
            }
        },
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: "AI_RICH_RESPONSE_TYPE_STANDARD",
                    submessages: submessages,
                    unifiedResponse: {
                        data: Buffer.from(JSON.stringify(unifiedResponseData)).toString('base64') },
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: {
                                botJid: "867051314767696@bot"
                            },
                                forwardOrigin: "META_AI",
                                ...ctxInfo
                            }
                        }
                    }
                }
    }

    return { message, nodes:[] }
}

export const executeAlbumMessage = async (sock, jid, medias, options = {}) => {
    const caption = options.caption || ''
    const mediaList = medias.map(m => {
        if (m.type && m.data) {
            return { [m.type]: m.data,
                caption: m.caption || '' }
            } return m
        }
    )

    if (mediaList.length < 2) {
        const item = mediaList[0]
        const typeKey = item.image ? 'image' : 'video'
        const content = {[typeKey]: item[typeKey], caption: caption || item.caption || '' }
        if (typeKey === 'document' || options.contextInfo)
            return await sock.sendMessage(jid, { ...content, ...options }, { quoted: options.quoted })
        return await sock.sendMessage(jid, content, { quoted: options.quoted })
    }

    const imageCount = mediaList.filter(item => item.image).length
    const videoCount = mediaList.filter(item => item.video).length

    const album = await generateWAMessageFromContent(jid, {
        albumMessage: {
            expectedImageCount: imageCount,
            expectedVideoCount: videoCount,
            ...(options.quoted ? {
                contextInfo: {
                    remoteJid: options.quoted.key.remoteJid,
                    fromMe: options.quoted.key.fromMe,
                    stanzaId: options.quoted.key.id,
                    participant: options.quoted.key.participant || options.quoted.key.remoteJid
        }
    } : { contextInfo: {} })
}
    }, { userJid: sock.user.id })

    await sock.relayMessage(jid, album.message, { messageId: album.key.id })

    for (let i = 0; i < mediaList.length; i++) {
        const item = mediaList[i]
        if (!item.image && !item.video) continue
        const mediaKey = item.image ? 'image' : 'video'
        const protoKey = item.image ? 'imageMessage' : 'videoMessage'
        const prepared = await prepareWAMessageMedia({ [mediaKey]: item[mediaKey] }, { upload: sock.waUploadToServer })
        const itemCaption = (i === 0 && caption) ? caption : (item.caption || '')
        if (itemCaption) prepared[protoKey].caption = itemCaption

        const container = await generateWAMessageFromContent(jid, {[protoKey]: prepared[protoKey],
            messageContextInfo: {
                messageAssociation: {
                    associationType: 1,
                    parentMessageKey: album.key
                }
            }
        }, { userJid: sock.user.id }
    )
        await sock.relayMessage(jid, container.message, { messageId: container.key.id })
        await new Promise(r => setTimeout(r, 500))
    }
    return album
}