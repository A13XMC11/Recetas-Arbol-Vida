import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatSpanishDate(dateStr: string): { day: string; month: string; year: string; full: string } {
  const date = new Date(dateStr + 'T12:00:00')
  const day = format(date, 'd', { locale: es })
  const month = format(date, 'MMMM', { locale: es })
  const year = format(date, 'yyyy', { locale: es })
  return {
    day,
    month,
    year,
    full: `${day} de ${month} de ${year}`,
  }
}
