import { checkPackage } from '../../../../app/utils/catalog'

/* Create. The id is the package's permanent slug; it cannot change later. */
export default defineEventHandler(async (event) => {
  const db = requireDb(event)
  const checked = checkPackage(await readBody(event).catch(() => null))
  if (!checked.ok) throw createError({ statusCode: 422, statusMessage: 'Check the highlighted fields', data: checked.errors })
  const p = checked.value
  if ((await readPackages(db, { id: p.id })).length) {
    throw createError({ statusCode: 409, statusMessage: 'That id is taken', data: { id: 'Another package already uses this id' } })
  }
  await assertNameFree(db, p.name, p.id)
  const last = await db.prepare('SELECT COALESCE(MAX(sort), -1) AS n FROM packages').first<{ n: number }>()
  p.sort = (last?.n ?? -1) + 1
  await writePackage(db, p, event.context.admin!.email)
  setResponseStatus(event, 201)
  return (await readPackages(db, { id: p.id }))[0]
})
