import { checkSettings } from '../../../app/utils/catalog'

export default defineEventHandler(async (event) => {
  const db = requireDb(event)
  const checked = checkSettings(await readBody(event).catch(() => null))
  if (!checked.ok) throw createError({ statusCode: 422, statusMessage: 'Check the highlighted fields', data: checked.errors })
  await writeSettings(db, checked.value, event.context.admin!.email)
  return checked.value
})
