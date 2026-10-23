import { checkPackage } from '../../../../app/utils/catalog'

/* Update. The id comes from the path; the position in the list is kept. */
export default defineEventHandler(async (event) => {
  const db = requireDb(event)
  const id = getRouterParam(event, 'id')!
  const [current] = await readPackages(db, { id })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'No such package' })
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const checked = checkPackage({ ...body, id, sort: current.sort })
  if (!checked.ok) throw createError({ statusCode: 422, statusMessage: 'Check the highlighted fields', data: checked.errors })
  await assertNameFree(db, checked.value.name, id)
  await writePackage(db, checked.value, event.context.admin!.email)
  return (await readPackages(db, { id }))[0]
})
