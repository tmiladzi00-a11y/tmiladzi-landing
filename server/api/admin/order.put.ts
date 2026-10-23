/* Display order: the full list of package ids, first to last. */
export default defineEventHandler(async (event) => {
  const db = requireDb(event)
  const body = await readBody<{ ids?: unknown }>(event).catch(() => null)
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === 'string') : []
  if (!ids.length) throw createError({ statusCode: 400, statusMessage: 'Send ids in display order' })
  await db.batch(ids.map((id, i) => db.prepare('UPDATE packages SET sort = ?1 WHERE id = ?2').bind(i, id)))
  return { ok: true }
})
