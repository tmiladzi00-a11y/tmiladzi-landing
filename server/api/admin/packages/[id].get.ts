export default defineEventHandler(async (event) => {
  const [p] = await readPackages(requireDb(event), { id: getRouterParam(event, 'id') })
  if (!p) throw createError({ statusCode: 404, statusMessage: 'No such package' })
  return p
})
