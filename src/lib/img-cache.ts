const MAX_PARALLEL = 4
let running = 0
const queue: string[] = []

function preloadImage(url: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = url
  })
}

function processQueue() {
  while (running < MAX_PARALLEL && queue.length > 0) {
    const url = queue.shift()!
    running++
    preloadImage(url).finally(() => { running--; processQueue() })
  }
}

export function preloadBatch(urls: string[]) {
  for (const url of urls) {
    if (!queue.includes(url)) queue.push(url)
  }
  processQueue()
}
