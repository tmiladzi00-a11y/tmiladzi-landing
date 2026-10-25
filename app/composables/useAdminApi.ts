import type { Errors } from '~/utils/catalog'

export interface AdminResult<T> { data?: T; error?: string; fields?: Errors }

/* $fetch for /api/admin that answers instead of throwing: the API's message
   and, on a 422, its per-field errors (see server/api/admin). */
export async function adminCall<T>(url: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<AdminResult<T>> {
  try {
    return { data: (await $fetch(url, opts)) as T }
  } catch (e) {
    const body = (e as { data?: { statusMessage?: string; message?: string; data?: Errors } }).data
    return { error: body?.statusMessage || body?.message || 'The request failed. Check your connection and try again.', fields: body?.data }
  }
}

export interface AdminMe { email: string; database: boolean; mail: boolean; mailTo: string }

export function useAdminMe() {
  return useAsyncData('admin-me', () => adminCall<AdminMe>('/api/admin/me'))
}
