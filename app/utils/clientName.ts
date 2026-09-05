import type { Project } from '~/content/types'

/* A client's name is published only where clearance exists. This is a legal
   control, not a display preference: every surface that names a client goes
   through here, so one flag reveals or hides the name everywhere at once. */
export function clientName(p: Pick<Project, 'client' | 'cleared' | 'anonClient'>): string {
  return p.cleared === false && p.anonClient ? p.anonClient : p.client
}
