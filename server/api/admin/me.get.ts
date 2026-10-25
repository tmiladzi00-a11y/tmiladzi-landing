export default defineEventHandler((event) => ({
  email: event.context.admin!.email,
  database: !!useDb(event),
  mail: mailConfigured(event),
  mailTo: studioAddress(event),
}))
