import { revalidatePath } from 'next/cache'
import { after } from 'next/server'

// Storefront pages are cached; any admin write marks them all stale once the write has finished
export const refreshStorefront = () => after(() => revalidatePath('/', 'layout'))
