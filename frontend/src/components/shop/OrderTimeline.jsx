import { Check, X } from 'lucide-react'
import { STATUS, STATUS_META, formatDateTime } from '../../lib/format'
import { cx } from '../ui'

const HAPPY_PATH = [STATUS.PENDING, STATUS.CONFIRMED, STATUS.SHIPPING, STATUS.RECEIVED]

/** Các bước của đơn: bước đã qua có giờ, bước hiện tại nổi bật, bước sau mờ. */
export default function OrderTimeline({ order }) {
  const history = order.invoiceStatuses || []
  const at = (id) => history.find((h) => h.status?.id === id)
  const current = order.status?.id
  const ended = current === STATUS.CANCELLED || current === STATUS.REFUSED
  const steps = [...(at(STATUS.AWAITING_PAYMENT) || current === STATUS.AWAITING_PAYMENT ? [STATUS.AWAITING_PAYMENT] : []), ...HAPPY_PATH]
  const shown = ended ? [...steps.filter((s) => at(s)), current] : steps
  const currentIndex = shown.indexOf(current)

  return (
    <ol className="relative space-y-0">
      {shown.map((s, i) => {
        const done = i < currentIndex || (i === currentIndex && s === STATUS.RECEIVED)
        const isCurrent = i === currentIndex
        const bad = isCurrent && ended
        const h = at(s)
        return (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
            {i < shown.length - 1 && <span className={cx('absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5', i < currentIndex ? 'bg-success' : 'bg-line')} aria-hidden="true" />}
            <span className={cx('relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-bold',
              bad ? 'border-danger bg-danger text-paper' : done ? 'border-success bg-success text-white' : isCurrent ? 'border-brand bg-brand text-white' : 'border-line bg-paper text-muted')}>
              {bad ? <X className="size-4" /> : done ? <Check className="size-4" /> : i + 1}
            </span>
            <div className="pt-1">
              <p className={cx('font-semibold', !h && !isCurrent && 'text-muted')}>{STATUS_META[s]?.label}</p>
              {h && <p className="text-sm text-muted">{formatDateTime(h.createdDate, h.createdTime)}{h.changedByName ? ` · ${h.changedByName}` : ''}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
