import * as v from 'valibot'
import { phoneSchema } from '@/features/checkout/schemas'

export const orderNumberSchema = v.pipe(v.string(), v.trim(), v.maxLength(64))
export const trackSchema = v.object({ phone: phoneSchema })
