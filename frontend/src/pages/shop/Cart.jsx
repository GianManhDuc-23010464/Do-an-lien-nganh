import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, ShoppingBag } from 'lucide-react'
import { useCart } from '../../lib/cart'
import { useAuth } from '../../lib/auth'
import { useDocumentTitle } from '../../lib/hooks'
import { formatMoney, productImage } from '../../lib/format'
import { Empty, PageLoader, QuantityInput, useConfirm } from '../../components/ui'

export default function Cart() {
  useDocumentTitle('Giỏ hàng')
  const cart = useCart()
  const { items, loading, selected, selectedItems, selectedSubtotal, toggle, selectAll, update, remove } = cart
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const confirm = useConfirm()

  if (loading) return <PageLoader />
  if (!items.length) {
    return (
      <div className="container-x">
        <MobileTitle count={0} />
        <Empty icon={ShoppingBag} title="Giỏ hàng của bạn còn trống" action={<Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>} />
      </div>
    )
  }

  const run = (fn) => fn().catch((e) => toast.error(e.message))
  const available = items.filter((i) => i.size.quantity > 0)
  const allChecked = available.length > 0 && available.every((i) => selected.has(i.size.id))
  const removeItem = async (it) => {
    if (await confirm({ title: 'Xóa sản phẩm?', message: `Bỏ “${it.product.name}” khỏi giỏ hàng?`, danger: true, confirmText: 'Xóa' })) run(() => remove(it.size.id))
  }
  const removeSelected = async () => {
    if (!selectedItems.length) return
    if (!(await confirm({ title: `Xóa ${selectedItems.length} sản phẩm?`, message: 'Các sản phẩm đã chọn sẽ bị bỏ khỏi giỏ hàng.', danger: true, confirmText: 'Xóa' }))) return
    for (const it of selectedItems) await remove(it.size.id).catch((e) => toast.error(e.message))
  }
  const checkout = () => {
    if (!selectedItems.length) return toast.error('Bạn chưa chọn sản phẩm nào để mua')
    if (selectedItems.some((i) => i.quantity > i.size.quantity)) return toast.error('Có sản phẩm vượt quá số lượng còn lại')
    navigate(isLoggedIn ? '/checkout' : '/login?next=/checkout')
  }

  return (
    <div className="pb-28 md:pb-10">
      <MobileTitle count={items.length} />
      <div className="container-x pt-2 md:pt-8">
        <h1 className="hidden text-xl font-semibold md:block">Giỏ hàng</h1>

        <div className="mt-4 hidden grid-cols-[40px_1fr_140px_140px_140px_60px] items-center bg-mist px-4 py-3 text-[13px] text-muted md:grid">
          <input type="checkbox" className="size-4 accent-brand" checked={allChecked} onChange={(e) => selectAll(e.target.checked)} aria-label="Chọn tất cả" />
          <span>Sản phẩm</span><span className="text-center">Đơn giá</span><span className="text-center">Số lượng</span><span className="text-center">Số tiền</span><span />
        </div>

        <ul className="divide-y divide-line border-b border-line md:border-x">
          {items.map((it) => {
            const out = it.size.quantity === 0
            const over = !out && it.quantity > it.size.quantity
            return (
              <li key={it.size.id} className="grid grid-cols-[28px_1fr] gap-3 px-1 py-4 md:grid-cols-[40px_1fr_140px_140px_140px_60px] md:items-center md:gap-0 md:px-4">
                <input type="checkbox" className="mt-8 size-4 accent-brand md:mt-0" disabled={out} checked={selected.has(it.size.id)} onChange={() => toggle(it.size.id)} aria-label={`Chọn ${it.product.name}`} />
                <div className="flex gap-3">
                  <Link to={`/product/${it.product.id}`} className="shrink-0"><img src={it.color?.linkImage || productImage(it.product)} alt="" className="size-20 bg-mist object-cover" /></Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${it.product.id}`} className="line-clamp-2 text-[13px] hover:underline">{it.product.name}</Link>
                    <p className="mt-1 inline-block bg-mist px-2 py-0.5 text-xs text-ink-soft">Phân loại: {it.color?.colorName}, {it.size.sizeName}</p>
                    {out && <p className="mt-1 text-xs text-danger">Đã hết hàng</p>}
                    {over && <p className="mt-1 text-xs text-danger">Chỉ còn {it.size.quantity} sản phẩm</p>}
                    {/* Điện thoại: giá + số lượng ngay dưới tên */}
                    <div className="mt-2 flex items-center justify-between md:hidden">
                      <span className="text-sm font-medium text-brand">{formatMoney(it.product.price)}</span>
                      <QuantityInput small value={it.quantity} max={Math.max(it.size.quantity, 1)} onChange={(q) => run(() => update(it.size.id, q))} />
                    </div>
                    <button className="mt-1 text-xs text-muted hover:text-danger md:hidden" onClick={() => removeItem(it)}>Xóa</button>
                  </div>
                </div>
                <span className="hidden text-center text-[13px] md:block">
                  {it.product.oldPrice > it.product.price && <s className="mr-1.5 text-muted">{formatMoney(it.product.oldPrice)}</s>}
                  {formatMoney(it.product.price)}
                </span>
                <div className="hidden justify-center md:flex"><QuantityInput small value={it.quantity} max={Math.max(it.size.quantity, 1)} onChange={(q) => run(() => update(it.size.id, q))} /></div>
                <span className="hidden text-center text-[13px] font-medium text-brand md:block">{formatMoney(it.product.price * it.quantity)}</span>
                <button className="hidden text-[13px] text-ink-soft hover:text-danger md:block" onClick={() => removeItem(it)}>Xóa</button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Thanh thanh toán cố định ở đáy, giống giỏ hàng các app mua sắm */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:sticky md:mx-auto md:mt-6 md:max-w-[1152px] md:border md:shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="container-x flex h-16 items-center gap-3 md:px-6">
          <label className="flex shrink-0 items-center gap-2 text-[13px]">
            <input type="checkbox" className="size-4 accent-brand" checked={allChecked} onChange={(e) => selectAll(e.target.checked)} /> Tất cả
          </label>
          <button className="hidden text-[13px] text-ink-soft hover:text-danger md:block" onClick={removeSelected}>Xóa</button>
          <div className="ml-auto text-right">
            <p className="text-[13px]">Tổng <span className="hidden md:inline">thanh toán ({selectedItems.length} sản phẩm)</span></p>
            <p className="text-lg font-semibold leading-tight text-brand">{formatMoney(selectedSubtotal)}</p>
          </div>
          <button className="btn btn-primary h-11 min-w-28 md:min-w-44" onClick={checkout}>Mua hàng ({selectedItems.length})</button>
        </div>
      </div>
    </div>
  )
}

function MobileTitle({ count }) {
  const navigate = useNavigate()
  return (
    <div className="flex h-12 items-center gap-2 border-b border-line px-2 md:hidden">
      <button className="p-2" onClick={() => navigate(-1)} aria-label="Quay lại"><ChevronLeft className="size-5" /></button>
      <h1 className="text-base font-medium">Giỏ hàng {count > 0 && `(${count})`}</h1>
    </div>
  )
}

export function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={strong ? 'font-semibold' : ''}>{value}</dd>
    </div>
  )
}
