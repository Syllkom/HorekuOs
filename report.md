# Reporte de Limpieza

## Archivos Analizados

Total: 42

---

## Imports no usados

- path → /data/data/com.termux/files/home/HorekuOs/config.js

---

## Librerías faltantes

No faltan paquetes.

---

## Dependencias NO utilizadas

- @adiwajshing/keyed-db
- @google/generative-ai
- btch-downloader
- cheerio
- express
- qs
- libphonenumber-js
- human-readable
- node-cache
- yt-search
- form-data
- date-fns

---

## ";" estructurales

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:10

```js
* - Detecta ";" innecesarios
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:11

```js
* - Detecta ";" estructurales
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:12

```js
* - Auto-fix de ";" seguros
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:242

```js
if (!trimmed.includes(';')) {
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:247

```js
(trimmed.match(/;/g) || []).length
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:249

```js
// for (;;)
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:251

```js
/for\s*\(.*;.*;.*\)/.test(
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:266

```js
/^\(.*\)\s*\(\s*\)\s*;?$/.test(
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:283

```js
if (/;.+/.test(withoutLast)) {
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:295

```js
trimmed.endsWith(';') &&
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:315

```js
/;(\s*)$/,
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:384

```js
md += `## ";" estructurales\n\n`
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:401

```js
md += `## ";" innecesarios\n\n`
```

### /data/data/com.termux/files/home/HorekuOs/cleaner.cjs:446

```js
`Se corrigieron ";" en ${report.fixedSemicolons.length} archivos`
```

### /data/data/com.termux/files/home/HorekuOs/core/handlers/m.content.js:12

```js
if (message?.message?.[type]) { return type; }
```

### /data/data/com.termux/files/home/HorekuOs/core/handlers/m.content.js:13

```js
else { continue; }
```

### /data/data/com.termux/files/home/HorekuOs/core/handlers/m.content.js:23

```js
try { return messageExtractors[m.type](message) || ''; }
```

### /data/data/com.termux/files/home/HorekuOs/library/modules/BatchProcess.js:38

```js
for (let b = 0; b < batches; b++) {
```

### /data/data/com.termux/files/home/HorekuOs/library/modules/BatchProcess.js:42

```js
for (let i = 0; i < batchItems.length; i++) {
```

### /data/data/com.termux/files/home/HorekuOs/library/modules/BatchProcess.js:44

```js
for (let attempt = 0; attempt < config.RETRY_ATTEMPTS; attempt++) {
```

### /data/data/com.termux/files/home/HorekuOs/library/modules/ScraperRegistry.js:63

```js
}).on('ready', () => { resolve(); });
```

### /data/data/com.termux/files/home/HorekuOs/library/network/SocketExtensions.js:24

```js
try { const res = await axios.get(url, { responseType: 'arraybuffer' }); return res.data }
```

### /data/data/com.termux/files/home/HorekuOs/library/network/SocketExtensions.js:56

```js
if (resultFormat === 'base64') { const outputBuffer = await pipe.toBuffer(); return outputBuffer.toString('base64') }
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:9

```js
case 'url': name = 'cta_url'; params = { display_text: btn.text, url: btn.url, merchant_url: btn.url }; break
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:10

```js
case 'call': name = 'cta_call'; params = { display_text: btn.text, id: btn.phone || btn.id }; break
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:11

```js
case 'copy': name = 'cta_copy'; params = { display_text: btn.text, id: btn.id || 'copy', copy_code: btn.payload }; break
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:12

```js
case 'reminder': name = 'cta_reminder'; params = { display_text: btn.text, id: btn.id || 'rem_1' }; break
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:13

```js
case 'cancel_reminder': name = 'cta_cancel_reminder'; params = { display_text: btn.text, id: btn.id || 'rem_cancel' }; break
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:14

```js
case 'address': name = 'address_message'; params = { display_text: btn.text, id: btn.id || 'address_req' }; break
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:15

```js
case 'location': name = 'send_location'; params = { display_text: btn.text, id: btn.id || 'location_req' }; break
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:16

```js
case 'vcard': name = 'vcard_message'; params = { display_text: btn.text, vcard: btn.vcard }; break
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:17

```js
case 'list': name = 'single_select'; params = { title: btn.text, sections: btn.sections }; break
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:33

```js
params = { display_text: btn.text, id: btn.id || 'btn_default' }; break
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:215

```js
try { docBuffer = Buffer.isBuffer(data.document) ? data.document : await sock.getBuffer(data.document); } catch (e) {}
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:258

```js
const q = options.quoted; ctxInfo.stanzaId = q.key.id; ctxInfo.participant = q.key.participant || q.key.remoteJid; ctxInfo.quotedMessage = q.message;
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/InteractiveBuilder.js:349

```js
try { imgBuffer = Buffer.isBuffer(data.image) ? data.image : await sock.getBuffer(data.image); } catch (e) {}
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:60

```js
if (data.text) data.text += linksText.trimEnd(); else data.text = linksText.trim()
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:94

```js
const tokens =[]; let i = 0; const len = codeStr.length
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:99

```js
const ch = codeStr[i]; const next = codeStr[i + 1]
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:100

```js
if (/\s/.test(ch)) { let s = i; while (i < len && /\s/.test(codeStr[i])) i++; push(codeStr.slice(s, i), 'DEFAULT'); continue; }
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:102

```js
let s = i; if (next === '/') { i += 2
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:103

```js
while (i < len && codeStr[i] !== '\n') i++; }
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:104

```js
else { i += 2; while (i < len && !(codeStr[i] === '*' && codeStr[i + 1] === '/')) i++; i = Math.min(len, i + 2); }
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:109

```js
let s = i; const quote = ch; i++
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:116

```js
if (/[0-9]/.test(ch)) { let s = i; while (i < len && /[0-9._xobA-Fa-f]/.test(codeStr[i])) i++; push(codeStr.slice(s, i), 'NUMBER'); continue; }
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:117

```js
if (/[+\-*/%=<>!&|^~?:;.,[\]{}]/.test(ch)) { let s = i; if ((ch === '=' && next === '>') || (ch === '=' && next === '=')) { i += 2; } else { i++; } push(codeStr.slice(s, i), 'SYMBOL'); continue; }
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:122

```js
if (keywords.has(word)) { push(word, 'KEYWORD'); } else { let j = i
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:127

```js
push(ch, 'DEFAULT'); i++
```

### /data/data/com.termux/files/home/HorekuOs/library/network/builders/RichBuilder.js:305

```js
for (let i = 0; i < mediaList.length; i++) {
```

### /data/data/com.termux/files/home/HorekuOs/library/system/BootPrompt.js:105

```js
for (let i = 0; i < maxLines; i++) {
```

### /data/data/com.termux/files/home/HorekuOs/library/system/ProcessManager.js:110

```js
} catch (e) { console.error('Error handling exit event:', e); }
```

### /data/data/com.termux/files/home/HorekuOs/library/utils/CacheUtils.js:91

```js
rgb: (r, g, b) => `\x1b[38;2;${r};${g};${b}m`,
```

### /data/data/com.termux/files/home/HorekuOs/library/utils/CacheUtils.js:92

```js
bg: { rgb: (r, g, b) => `\x1b[48;2;${r};${g};${b}m` },
```

---

## ";" innecesarios

No se encontraron.

---

## Auto-fix

Modo desactivado.
