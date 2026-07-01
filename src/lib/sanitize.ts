export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:text\/html/gi, '')
    .slice(0, 200)
}

export function isMalicious(input: string): boolean {
  const patterns = [/<script/i, /onerror\s*=/i, /onload\s*=/i, /javascript:/i, /data:text\/html/i]
  return patterns.some(p => p.test(input))
}
