import { formatDistanceToNowStrict as fdtns } from 'date-fns'
import locale from 'date-fns/locale/en-US'

const formatDistanceLocale = {
  lessThanXSeconds: '{{count}} secs',
  xSeconds: '{{count}} secs',
  halfAMinute: '30 secs',
  lessThanXMinutes: '{{count}} mins',
  xMinutes: '{{count}} mins',
  aboutXHours: '{{count}} hours',
  xHours: '{{count}} hours',
  xDays: '{{count}} days',
  aboutXWeeks: '{{count}} weeks',
  xWeeks: '{{count}} weeks',
  aboutXMonths: '{{count}} months',
  xMonths: '{{count}}  months',
  aboutXYears: '{{count}} years',
  xYears: '{{count}} years',
  overXYears: '{{count}} years',
  almostXYears: '{{count}} years',
}

function formatDistance(token, count, options) {
  options = options || {}

  const result = formatDistanceLocale[token].replace('{{count}}', count)

  // options.includeSeconds
  // options.addSuffix
  // if (options.addSuffix) {
  //   if (options.comparison > 0) {
  //     return 'in ' + result
  //   } else {
  //     return result + ' ago'
  //   }
  // }

  return `${result} ago`
}

export default function formatDistanceToNowStrict(datems, options) {
  return fdtns(datems, {
    locale: {
      ...locale,
      formatDistance,
    },
    ...options,
  })
}
