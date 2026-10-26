import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { api } from '../../lib/api'
import { formatMoney, productImage } from '../../lib/format'
import { QuantityInput, Spinner, cx } from '../ui'

/**
 * Bảng chọn phân loại (màu, size, số lượng) trượt lên từ đáy màn hình — như khi bấm
 * "Thêm vào giỏ hàng" / "Mua ngay" trên các app mua sắm.
 * onConfirm({ color, size, quantity }) trả về Promise.
 */
export default function VariantSheet({ open, product, mode, initial, onClose, onConfirm }) {
  const colors = product.productColors || []
  const [color, setColor] = useState(initial?.color || colors[0] || null)
  const [sizes, setSizes] = useState(initial?.color?.productSizes || colors[0]?.productSizes || [])
  const [size, setSize] = useState(initial?.size || null)
  const [qty, setQty] = useState(initial?.quantity || 1)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setColor(initial?.color || colors[0] || null)
    setSize(initial?.size || null)
    setQty(initial?.quantity || 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!color) return
    if (color.productSizes?.length) setSizes(color.productSizes)
    else api.get('/api/product-size/public/find-by-product-color', { idProColor: color.id }).then((s) => setSizes(s || [])).catch(() => setSizes([]))
  }, [color])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null
  const confirm = async () => {
    setBusy(true)
    try { await onConfirm({ color, size, quantity: qty }) } finally { setBusy(false) }
  }
  const stock = size ? size.quantity : sizes.reduce((s, x) => s + (x.quantity || 0), 0)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Chọn phân loại" className="w-full bg-paper sm:max-w-md">
        <div className="flex gap-3 border-b border-line p-4">
          <img src={color?.linkImage || productImage(product)} alt="" className="size-24 shrink-0 bg-mist object-cover" />
          <div className="flex min-w-0 flex-1 flex-col justify-end">
            <p className="text-lg font-semibold text-brand">{formatMoney(product.price)}</p>
            <p className="text-[13px] text-muted">Kho: {stock}</p>
            <p className="line-clamp-1 text-[13px] text-ink-soft">{[color?.colorName, size?.sizeName].filter(Boolean).join(', ') || 'Chọn màu và size'}</p>
          </div>
          <button className="self-start p-1 text-muted hover:text-ink" onClick={onClose} aria-label="Đóng"><X className="size-5" /></button>
        </div>
        <div className="max-h-[50vh] space-y-5 overflow-y-auto p-4">
          {colors.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium">Màu sắc</legend>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button key={c.id} type="button" onClick={() => { setColor(c); setSize(null); setQty(1) }} aria-pressed={color?.id === c.id}
                    className={cx('flex items-center gap-2 border px-2 py-1 text-[13px]', color?.id === c.id ? 'border-brand text-brand' : 'border-line')}>
                    <img src={c.linkImage || '/placeholder.svg'} alt="" className="size-6 object-cover" /> {c.colorName}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium">Size</legend>
            <SizeButtons sizes={sizes} value={size} onChange={(s) => { setSize(s); setQty(1) }} />
          </fieldset>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">Số lượng</span>
            <QuantityInput small value={qty} onChange={setQty} max={size?.quantity || 1} />
          </div>
        </div>
        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button className="btn btn-primary btn-lg w-full" disabled={!size || busy} onClick={confirm}>
            {busy && <Spinner className="size-4" />} {mode === 'buy' ? 'Mua ngay' : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function SizeButtons({ sizes, value, onChange }) {
  if (!sizes.length) return <p className="text-[13px] text-muted">Màu này tạm hết hàng.</p>
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((s) => {
        const out = !s.quantity
        return (
          <button key={s.id} type="button" disabled={out} onClick={() => onChange(s)} aria-pressed={value?.id === s.id}
            className={cx('h-9 min-w-12 border px-3 text-[13px]',
              value?.id === s.id ? 'border-brand text-brand' : 'border-line hover:border-ink',
              out && 'cursor-not-allowed border-dashed text-muted line-through')}>
            {s.sizeName}
          </button>
        )
      })}
    </div>
  )
}
