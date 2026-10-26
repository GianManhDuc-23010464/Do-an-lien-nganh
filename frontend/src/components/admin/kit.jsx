import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { ImagePlus, Search, X } from 'lucide-react'
import { uploadImage, uploadImages } from '../../lib/api'
import { Spinner, cx } from '../ui'

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ title, actions, children, className, padded = true }) {
  return (
    <section className={cx('rounded-sm border border-line bg-paper', className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold">{title}</h2>
          {actions}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  )
}

export function SearchBox({ value, onChange, placeholder = 'Tìm kiếm…' }) {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input className="field h-10 pl-9" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder} />
    </div>
  )
}

/** Bảng dữ liệu: columns = [{ key, title, render, className }] */
export function Table({ columns, rows, rowKey = 'id', onRowClick, empty = 'Chưa có dữ liệu', loading }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs font-semibold text-muted">
            {columns.map((c) => <th key={c.key} className={cx('px-4 py-3 font-semibold', c.className)}>{c.title}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {loading ? (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted"><Spinner className="mx-auto size-5" /></td></tr>
          ) : !rows?.length ? (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted">{empty}</td></tr>
          ) : rows.map((r) => (
            <tr key={r[rowKey]} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cx(onRowClick && 'cursor-pointer hover:bg-mist/60')}>
              {columns.map((c) => <td key={c.key} className={cx('px-4 py-3 align-middle', c.className)}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Ô chọn 1 ảnh, tự upload và trả về link */
export function ImageField({ value, onChange, label = 'Ảnh', className = 'aspect-square w-32' }) {
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)
  const pick = async (file) => {
    if (!file) return
    setBusy(true)
    try { onChange(await uploadImage(file)) } catch (e) { toast.error(e.message) } finally { setBusy(false); if (ref.current) ref.current.value = '' }
  }
  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div className={cx('relative overflow-hidden rounded-sm border-2 border-dashed border-line bg-mist', className)}>
        {value ? <img src={value} alt="" className="size-full object-cover" /> : (
          <button type="button" className="grid size-full place-items-center text-muted hover:text-ink" onClick={() => ref.current?.click()}>
            {busy ? <Spinner /> : <span className="flex flex-col items-center gap-1 text-xs font-medium"><ImagePlus className="size-6" /> Chọn ảnh</span>}
          </button>
        )}
        {value && (
          <div className="absolute right-1.5 top-1.5 flex gap-1">
            <button type="button" className="rounded-full bg-paper/90 px-2 py-1 text-xs font-semibold shadow" onClick={() => ref.current?.click()}>{busy ? '…' : 'Đổi'}</button>
            <button type="button" className="grid size-6 place-items-center rounded-full bg-paper/90 shadow" onClick={() => onChange('')} aria-label="Bỏ ảnh"><X className="size-3.5" /></button>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files[0])} />
      </div>
    </div>
  )
}

/** Thêm nhiều ảnh: gọi onAdd(links) */
export function MultiImageButton({ onAdd }) {
  const [busy, setBusy] = useState(false)
  return (
    <label className={cx('grid aspect-square w-24 cursor-pointer place-items-center rounded-sm border-2 border-dashed border-line bg-mist text-muted hover:text-ink', busy && 'pointer-events-none')}>
      {busy ? <Spinner /> : <span className="flex flex-col items-center gap-1 text-xs font-medium"><ImagePlus className="size-6" /> Thêm ảnh</span>}
      <input type="file" accept="image/*" multiple className="sr-only" onChange={async (e) => {
        const files = Array.from(e.target.files)
        e.target.value = ''
        if (!files.length) return
        setBusy(true)
        try { onAdd(await uploadImages(files)) } catch (err) { toast.error(err.message) } finally { setBusy(false) }
      }} />
    </label>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={cx('relative h-6 w-11 rounded-full transition-colors', checked ? 'bg-ink' : 'bg-line')}>
        <span className={cx('absolute top-0.5 size-5 rounded-full bg-paper shadow transition-transform', checked ? 'translate-x-5.5' : 'translate-x-0.5')} />
      </button>
      {label}
    </label>
  )
}
