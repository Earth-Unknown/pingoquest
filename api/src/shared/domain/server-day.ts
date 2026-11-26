import { DomainError } from '@/shared/domain/domain-error'

export const APP_TIMEZONE = 'America/Sao_Paulo'

const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export class ServerDay {
  private constructor(readonly value: string) {
    Object.freeze(this)
  }

  static fromDate(date: Date): ServerDay {
    if (Number.isNaN(date.getTime())) {
      throw new DomainError('invalid_input', 'invalid_server_day', 'Data inválida.')
    }
    return new ServerDay(dayFormatter.format(date))
  }

  static parse(value: string): ServerDay {
    const match = DAY_PATTERN.exec(value)
    if (!match) {
      throw new DomainError('invalid_input', 'invalid_server_day', 'Dia inválido. Use AAAA-MM-DD.')
    }
    const [, year, month, day] = match.map(Number)
    const check = new Date(Date.UTC(year!, month! - 1, day!))
    const isRealDate =
      check.getUTCFullYear() === year && check.getUTCMonth() === month! - 1 && check.getUTCDate() === day
    if (!isRealDate) {
      throw new DomainError('invalid_input', 'invalid_server_day', 'Dia inexistente no calendário.')
    }
    return new ServerDay(value)
  }

  equals(other: ServerDay): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
