/* "Send a test email" in the admin: sends one plain message to the studio
   inbox and reports exactly what happened, so a missing key or an unverified
   domain shows up as words rather than silence. */
export default defineEventHandler(async (event) => {
  const to = studioAddress(event)
  const r = await sendMail(event, {
    to, tag: 'test',
    subject: 'Test email from the Tmiladzi website',
    text: `This is a test sent from the admin by ${event.context.admin!.email}. If you can read it, booking and brief emails will arrive here too.`,
    html: renderEmail({
      eyebrow: 'Test email', tone: 'green', title: 'Email is working.',
      preheader: 'Booking and brief emails will arrive here.',
      blocks: [{ p: `Sent from the admin by ${event.context.admin!.email}. Booking requests and project briefs will arrive in this inbox.` }],
    }),
  })
  return { to, ...r }
})
