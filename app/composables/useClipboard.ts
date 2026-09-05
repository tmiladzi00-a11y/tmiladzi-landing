/** Copy text with a selection fallback; resolves to the label to show. */
export async function copyText(text: string, el?: HTMLElement | null): Promise<'Copied' | 'Select and copy'> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return 'Copied'
    }
  } catch { /* fall through */ }
  if (el) {
    const r = document.createRange(); r.selectNodeContents(el)
    const s = window.getSelection(); s?.removeAllRanges(); s?.addRange(r)
    try { document.execCommand('copy'); return 'Copied' } catch { /* ignore */ }
  }
  return 'Select and copy'
}
