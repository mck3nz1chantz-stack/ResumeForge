/** Register service worker in production builds (and optionally when forced). */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return

  // Enable in prod always; in dev only if VITE_PWA_DEV=1 (LAN phone testing)
  const allowDev = import.meta.env.VITE_PWA_DEV === '1'
  if (import.meta.env.DEV && !allowDev) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW register failed', err)
    })
  })
}
