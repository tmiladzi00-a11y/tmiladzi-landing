import { studioToday } from '../../../../app/utils/booking'

export default defineEventHandler((event) => listBlocks(requireDb(event), studioToday()))
