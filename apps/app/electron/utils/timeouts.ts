export function autoClearTimeout(callback: () => void, ms: number, clearAfter: number = 5 * 60 * 1000) {
    const timeout = setTimeout(callback, ms)
    setTimeout(() => clearTimeout(timeout), clearAfter)
    return timeout
}

export function autoClearInterval(callback: () => void, ms: number, clearAfter: number = 5 * 60 * 1000) {
    const interval = setInterval(callback, ms)
    setTimeout(() => clearInterval(interval), clearAfter)
    return interval
}