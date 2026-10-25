export default defineEventHandler(async (event) => {
  const r = await requireDb(event).prepare('DELETE FROM blocks WHERE id = ?1').bind(Number(getRouterParam(event, 'id'))).run()
  if (!r.meta?.changes) throw createError({ statusCode: 404, statusMessage: 'No such block' })
  return { ok: true }
})
