/* A fingerprint of the exact terms text on screen when the client ticked the
   box. Terms change; this does not. Two years from now it is what proves which
   wording was accepted. Cheap 32-bit FNV-1a — enough to detect that the text
   differs, and it needs no library. Swap for SHA-256 server-side if you ever
   need it to stand up on its own. */
export function fnv1a(t: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return 'fnv1a-' + h.toString(16) + '-len' + t.length
}

export function normaliseTerms(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Fetches the rendered /terms page and fingerprints its legal column. */
export function useTermsFingerprint() {
  const fingerprint = ref('unavailable')
  onMounted(async () => {
    try {
      const html = await (await fetch('/terms')).text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const el = doc.querySelector('.legal')
      if (el) fingerprint.value = fnv1a(normaliseTerms(el.textContent || ''))
    } catch { /* stays "unavailable"; the version string still travels */ }
  })
  return fingerprint
}
