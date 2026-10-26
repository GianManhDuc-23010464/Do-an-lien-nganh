import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Loader2, Star, X } from 'lucide-react'
import { STATUS_META, discountPercent, formatMoney } from '../../lib/format'

export function cx(...a) {
  return a.filter(Boolean).join(' ')
}

export function Spinner({ className = 'size-5' }) {
  return <Loader2 className={cx('animate-spin', className)} aria-hidden="true" />
}

export function PageLoader({ label = 'Đang tải…' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-muted" role="status">
      <Spinner /> <span>{label}</span>
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="mx-auto my-16 max-w-md rounded-sm border border-danger/30 bg-danger-soft p-6 text-center">
      <p className="font-semibold text-danger">{error?.message || 'Không tải được dữ liệu'}</p>
      {onRetry && <button className="btn btn-outline btn-sm mt-4" onClick={onRetry}>Thử lại</button>}
    </div>
  )
}

export function Empty({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 grid size-16 place-items-center rounded-full bg-mist text-muted">
          <Icon className="size-7" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {children && <p className="mt-1.5 max-w-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Price({ price, oldPrice, size = 'md' }) {
  const big = size === 'lg'
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className={cx('font-semibold text-ink', big ? 'text-3xl' : 'text-[17px]')}>{formatMoney(price)}</span>
      {oldPrice > price && <s className={cx('text-muted', big ? 'text-lg' : 'text-sm')}>{formatMoney(oldPrice)}</s>}
    </div>
  )
}

export function SaleSticker({ price, oldPrice, className }) {
  const pct = discountPercent(price, oldPrice)
  if (!pct) return null
  return <span className={cx('sticker bg-brand text-white', className)}>-{pct}%</span>
}

export function Stars({ value = 0, size = 'size-4', onChange }) {
  return (
    <div className="flex items-center gap-0.5" role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value)
        const icon = <Star className={cx(size, filled ? 'fill-brand text-brand' : 'text-line fill-line')} aria-hidden="true" />
        return onChange ? (
          <button key={i} type="button" role="radio" aria-checked={i === value} aria-label={`${i} sao`}
            className="p-0.5" onClick={() => onChange(i)}>{icon}</button>
        ) : <span key={i}>{icon}</span>
      })}
    </div>
  )
}

const TONES = {
  warning: 'bg-warning-soft text-[#8A5A00]',
  violet: 'bg-mist text-ink',
  mango: 'bg-[#EAF0F7] text-[#2D5A8A]',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  muted: 'bg-mist text-muted',
  pink: 'bg-brand-soft text-brand',
}

export function Badge({ tone = 'muted', children, className }) {
  return <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium', TONES[tone], className)}>{children}</span>
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status?.id] || { label: status?.name || '—', tone: 'muted' }
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}

export function Field({ label, error, hint, children, className }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="label">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
    </label>
  )
}

export function Modal({ open, onClose, title, children, footer, wide }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={cx('flex max-h-[92vh] w-full flex-col bg-paper shadow-2xl outline-none', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}>
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button className="btn btn-ghost btn-sm -mr-2 px-2" onClick={onClose} aria-label="Đóng"><X className="size-5" /></button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

const ConfirmContext = createContext(null)

/** const confirm = useConfirm(); if (await confirm({ title, message, danger })) … */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const confirm = useCallback((opts) => new Promise((resolve) => setState({ ...opts, resolve })), [])
  const close = (v) => { state?.resolve(v); setState(null) }
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={!!state} onClose={() => close(false)} title={state?.title || 'Xác nhận'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => close(false)}>{state?.cancelText || 'Không'}</button>
          <button className={cx('btn', state?.danger ? 'btn-danger' : 'btn-dark')} onClick={() => close(true)}>{state?.confirmText || 'Đồng ý'}</button>
        </>}>
        <p className="text-ink-soft">{state?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null
  const pages = []
  const from = Math.max(0, page - 2)
  const to = Math.min(totalPages - 1, page + 2)
  for (let i = from; i <= to; i++) pages.push(i)
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Phân trang">
      <button className="btn btn-ghost btn-sm px-2" disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Trang trước"><ChevronLeft className="size-4" /></button>
      {pages.map((i) => (
        <button key={i} onClick={() => onChange(i)} aria-current={i === page ? 'page' : undefined}
          className={cx('grid size-9 place-items-center text-[13px]', i === page ? 'bg-brand text-white' : 'hover:text-brand')}>{i + 1}</button>
      ))}
      <button className="btn btn-ghost btn-sm px-2" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} aria-label="Trang sau"><ChevronRight className="size-4" /></button>
    </nav>
  )
}

export function QuantityInput({ value, onChange, max = 99, min = 1, small }) {
  const h = small ? 'h-9' : 'h-11'
  return (
    <div className={cx('inline-flex items-center border border-line bg-paper', h)}>
      <button type="button" className="grid h-full w-9 place-items-center border-r border-line text-base hover:bg-mist disabled:opacity-40" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Giảm">−</button>
      <input className="w-11 bg-transparent text-center text-[13px] outline-none" inputMode="numeric" value={value} aria-label="Số lượng"
        onChange={(e) => { const n = parseInt(e.target.value, 10); if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n))) }} />
      <button type="button" className="grid h-full w-9 place-items-center border-l border-line text-base hover:bg-mist disabled:opacity-40" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Tăng">+</button>
    </div>
  )
}
