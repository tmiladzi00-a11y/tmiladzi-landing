import { studioToday } from '../../../app/utils/booking'

/* For the admin menu badge: requests waiting, and deposits past their hold. */
export default defineEventHandler((event) => bookingCounts(requireDb(event), studioToday()))
