export default defineEventHandler(async (event) => {
  const r = await requireDb(event).prepare('DELETE FROM packages WHERE id = ?1').bind(getRouterParam(event, 'id')).run()
  if (!r.meta?.changes) throw createError({ statusCode: 404, statusMessage: 'No such package' })
  return { ok: true }
})
