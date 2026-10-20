// Coupon dates are whole days in the store's time zone, whatever zone the server or the admin's browser runs in

export function zonedTime(day: string, time: string, timeZone: string) {
  const guess = new Date(`${day}T${time}Z`)
  const offset =
    new Date(guess.toLocaleString('en-US', { timeZone })).getTime() -
    new Date(guess.toLocaleString('en-US', { timeZone: 'UTC' })).getTime()
  return new Date(guess.getTime() - offset)
}

// 'en-CA' formats as YYYY-MM-DD, the value a date input expects
export const dayIn = (date: Date | string | number, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(date))
