export default defineEventHandler((event) => ({
  email: event.context.admin!.email,
  database: !!useDb(event),
}))
