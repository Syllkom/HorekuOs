const DEFAULT_CONFIG = {
  BATCH_SIZE: 5,
  DELAY_BETWEEN_ACTIONS: 2500,  // Entre ítems del mismo lote
  DELAY_BETWEEN_BATCHES: 8000, // Entre lotes
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 3000
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const estimateTime = (count, config) => {
  const batches = Math.ceil(count / config.BATCH_SIZE)
  const actionTime = count * config.DELAY_BETWEEN_ACTIONS
  const batchTime = (batches - 1) * config.DELAY_BETWEEN_BATCHES
  const totalMs = actionTime + batchTime
  
  const seconds = Math.ceil(totalMs / 1000)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

/**
 * @param {Array} items - Lista de JIDs o elementos
 * @param {Function} actionFn - Función asíncrona a ejecutar por ítem (debe retornar void)
 * @param {Object} m - Objeto del mensaje para enviar actualizaciones
 * @param {Object} options - Configuración personalizada
 */
export const processBatch = async (items, actionFn, m, options = {}) => {
  const config = { ...DEFAULT_CONFIG, ...options }
  const total = items.length
  let ok = 0, fail = 0
  
  const batches = Math.ceil(total / config.BATCH_SIZE)
  const timeStr = estimateTime(total, config)
  
  await m.reply(`↻ Procesando ${total} operaciones...\n⩇⩇:⩇⩇ Tiempo estimado: ~${timeStr}`)
  
  for (let b = 0; b < batches; b++) {
    const start = b * config.BATCH_SIZE
    const batchItems = items.slice(start, start + config.BATCH_SIZE)
    
    for (let i = 0; i < batchItems.length; i++) {
      let success = false
      for (let attempt = 0; attempt < config.RETRY_ATTEMPTS; attempt++) {
        try {
          await actionFn(batchItems[i])
          success = true
          ok++
          break
        } catch (e) {
          if (attempt < config.RETRY_ATTEMPTS - 1) await sleep(config.RETRY_DELAY)
        }
      }
      if (!success) fail++
      
      if (i < batchItems.length - 1) await sleep(config.DELAY_BETWEEN_ACTIONS)
    }
    
    if (b < batches - 1) {
      await m.reply(`● Lote ${b + 1}/${batches} completado (${ok}/${total} listos)`)
      await sleep(config.DELAY_BETWEEN_BATCHES)
    }
  }
  
  return { ok, fail, total }
}