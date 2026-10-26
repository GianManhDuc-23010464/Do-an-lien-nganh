import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Banknote, ChevronLeft, ChevronRight, MapPin, TicketPercent, Truck, Wallet, X } from 'lucide-react'
import { api } from '../../lib/api'
import { useCart } from '../../lib/cart'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { SHIPPING_FEE } from '../../lib/config'
import { formatMoney, fullAddress, productImage } from '../../lib/format'
import AddressForm from '../../components/shop/AddressForm'
import { Modal, PageLoader, Spinner, cx } from '../../components/ui'

const METHODS = [
  { id: 'PAYMENT_DELIVERY', title: 'Thanh toán khi nhận hàng', icon: Banknote },
  { id: 'PAYMENT_MOMO', title: 'Ví MoMo', icon: Wallet },
  { id: 'PAYMENT_VNPAY', title: 'VNPay (ATM, Visa, QR ngân hàng)', icon: Wallet },
]

export default function Checkout() {
  useDocumentTitle('Thanh toán')
  const navigate = useNavigate()
  const cart = useCart()
  const addresses = useFetch(() => api.get('/api/user-address/user/my-address'), [])
  const [addressId, setAddressId] = useState(null)
  const [addrModal, setAddrModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [payType, setPayType] = useState('PAYMENT_DELIVERY')
  const [note, setNote] = useState('')
  const [voucherOpen, setVoucherOpen] = useState(false)
  const [code, setCode] = useState('')
  const [voucher, setVoucher] = useState(null)
  const [checking, setChecking] = useState(false)
  const [placing, setPlacing] = useState(false)

  const items = cart.selectedItems
  const subtotal = cart.selectedSubtotal

  useEffect(() => {
    const list = addresses.data || []
    if (!addressId && list.length) setAddressId((list.find((a) => a.primaryAddres) || list[0]).id)
  }, [addresses.data, addressId])
  useEffect(() => { setVoucher(null) }, [subtotal])

  if (cart.loading || addresses.loading) return <PageLoader />
  if (!items.length && !placing) return <Navigate to="/cart" replace />

  const list = addresses.data || []
  const address = list.find((a) => a.id === addressId)
  const discount = voucher ? Math.min(voucher.discount, subtotal) : 0
  const total = subtotal - discount + SHIPPING_FEE

  const applyVoucher = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setChecking(true)
    try {
      const v = await api.get('/api/voucher/public/findByCode', { code: code.trim(), amount: subtotal })
      setVoucher(v)
      setVoucherOpen(false)
      toast.success(`Đã áp dụng mã giảm ${formatMoney(v.discount)}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setChecking(false)
    }
  }

  const place = async () => {
    if (!addressId) { setAddrModal(true); return toast.error('Vui lòng thêm địa chỉ nhận hàng') }
    setPlacing(true)
    try {
      const invoice = await api.post('/api/invoice/user/create', {
        payType, userAddressId: addressId, voucherCode: voucher?.code || null, note: note.trim() || null,
        returnUrl: window.location.origin + '/payment/result',
        listProductSize: items.map((i) => ({ idProductSize: i.size.id, quantity: i.quantity })),
      })
      cart.selectOnly([])
      if (invoice.paymentUrl) { window.location.href = invoice.paymentUrl; return }
      await cart.refresh()
      navigate(`/account/orders/${invoice.id}?placed=1`, { replace: true })
    } catch (err) {
      toast.error(err.message)
      setPlacing(false)
    }
  }

  return (
    <div className="bg-mist pb-32 md:pb-12">
      <div className="flex h-12 items-center gap-2 border-b border-line bg-paper px-2 md:hidden">
        <button className="p-2" onClick={() => navigate(-1)} aria-label="Quay lại"><ChevronLeft className="size-5" /></button>
        <h1 className="text-base font-medium">Thanh toán</h1>
      </div>
      <div className="container-x space-y-3 px-0 pt-3 sm:px-6 md:pt-8">
        <h1 className="hidden px-4 text-xl font-semibold sm:px-0 md:block">Thanh toán</h1>

        {/* Địa chỉ nhận hàng */}
        <button className="block w-full border-t-[3px] border-brand bg-paper p-4 text-left" onClick={() => setAddrModal(true)}>
          <p className="flex items-center gap-2 text-[13px] text-brand"><MapPin className="size-4" /> Địa chỉ nhận hàng</p>
          {address ? (
            <div className="mt-2 flex items-center gap-3">
              <div className="min-w-0 flex-1 text-[13px]">
                <p><span className="font-semibold">{address.fullname}</span> <span className="text-muted">| {address.phone}</span></p>
                <p className="mt-0.5 text-ink-soft">{fullAddress(address)}</p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted" />
            </div>
          ) : <p className="mt-2 text-[13px] text-ink-soft">Bạn chưa có địa chỉ. Bấm để thêm địa chỉ nhận hàng.</p>}
        </button>

        {/* Sản phẩm */}
        <section className="bg-paper">
          <h2 className="border-b border-line px-4 py-3 text-[13px] font-semibold">MADU <span className="font-normal text-muted">({items.length} sản phẩm)</span></h2>
          <ul className="divide-y divide-line">
            {items.map((i) => (
              <li key={i.size.id} className="flex gap-3 px-4 py-3">
                <img src={i.color?.linkImage || productImage(i.product)} alt="" className="size-16 shrink-0 bg-mist object-cover" />
                <div className="min-w-0 flex-1 text-[13px]">
                  <p className="line-clamp-1">{i.product.name}</p>
                  <p className="mt-0.5 text-xs text-muted">Phân loại: {i.color?.colorName}, {i.size.sizeName}</p>
                  <div className="mt-1 flex justify-between"><span>{formatMoney(i.product.price)}</span><span className="text-muted">x{i.quantity}</span></div>
                </div>
              </li>
            ))}
          </ul>
          <div className="grid gap-3 border-t border-line px-4 py-3 text-[13px] sm:grid-cols-[1fr_1fr]">
            <label className="flex items-center gap-3">
              <span className="shrink-0 text-ink-soft">Lời nhắn:</span>
              <input className="field h-9" maxLength={250} placeholder="Lưu ý cho người bán…" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <div className="flex items-center gap-3 sm:justify-end">
              <Truck className="size-4 text-success" />
              <span>Giao hàng tiêu chuẩn <span className="text-muted">(2–5 ngày)</span></span>
              <span className="ml-auto sm:ml-4">{formatMoney(SHIPPING_FEE)}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-line px-4 py-3 text-[13px]">
            Tổng số tiền ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm): <span className="font-semibold text-brand">{formatMoney(subtotal + SHIPPING_FEE)}</span>
          </div>
        </section>

        {/* Voucher */}
        <section className="bg-paper px-4 py-3 text-[13px]">
          {voucher ? (
            <div className="flex items-center gap-3">
              <TicketPercent className="size-5 text-brand" />
              <span className="flex-1">Mã <b>{voucher.code}</b>: giảm {formatMoney(discount)}</span>
              <button onClick={() => { setVoucher(null); setCode('') }} className="text-muted hover:text-ink" aria-label="Bỏ mã"><X className="size-4" /></button>
            </div>
          ) : voucherOpen ? (
            <form onSubmit={applyVoucher} className="flex gap-2">
              <input className="field h-10" autoFocus placeholder="Nhập mã giảm giá" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} aria-label="Mã giảm giá" />
              <button className="btn btn-dark h-10" disabled={checking}>{checking ? <Spinner className="size-4" /> : 'Áp dụng'}</button>
            </form>
          ) : (
            <button className="flex w-full items-center gap-3" onClick={() => setVoucherOpen(true)}>
              <TicketPercent className="size-5 text-brand" /> <span className="flex-1 text-left">Mã giảm giá MADU</span> <span className="text-muted">Chọn hoặc nhập mã</span> <ChevronRight className="size-4 text-muted" />
            </button>
          )}
        </section>

        {/* Phương thức thanh toán */}
        <section className="bg-paper">
          <h2 className="border-b border-line px-4 py-3 text-[13px] font-semibold">Phương thức thanh toán</h2>
          <div role="radiogroup" aria-label="Phương thức thanh toán">
            {METHODS.map((m) => (
              <button key={m.id} role="radio" aria-checked={payType === m.id} onClick={() => setPayType(m.id)}
                className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left text-[13px] last:border-b-0">
                <m.icon className="size-5 text-ink-soft" />
                <span className="flex-1">{m.title}</span>
                <span className={cx('grid size-[18px] place-items-center rounded-full border', payType === m.id ? 'border-brand' : 'border-line')}>
                  {payType === m.id && <span className="size-2.5 rounded-full bg-brand" />}
                </span>
              </button>
            ))}
          </div>
          {payType !== 'PAYMENT_DELIVERY' && <p className="bg-mist/60 px-4 py-2 text-xs text-ink-soft">Bạn sẽ được chuyển sang trang thanh toán. Đơn được giữ hàng 30 phút.</p>}
        </section>

        {/* Chi tiết thanh toán */}
        <section className="bg-paper px-4 py-3 text-[13px]">
          <h2 className="mb-2 font-semibold">Chi tiết thanh toán</h2>
          <dl className="space-y-1.5 text-ink-soft">
            <div className="flex justify-between"><dt>Tổng tiền hàng</dt><dd>{formatMoney(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Phí vận chuyển</dt><dd>{formatMoney(SHIPPING_FEE)}</dd></div>
            {discount > 0 && <div className="flex justify-between"><dt>Giảm giá voucher</dt><dd>-{formatMoney(discount)}</dd></div>}
            <div className="flex justify-between pt-1 text-[15px] text-ink"><dt>Tổng thanh toán</dt><dd className="font-semibold text-brand">{formatMoney(total)}</dd></div>
          </dl>
        </section>
      </div>

      {/* Thanh đặt hàng cố định */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)]">
        <div className="container-x flex h-16 items-center justify-end gap-4">
          <div className="text-right">
            <p className="text-[13px]">Tổng thanh toán</p>
            <p className="text-lg font-semibold leading-tight text-brand">{formatMoney(total)}</p>
          </div>
          <button className="btn btn-primary h-11 min-w-32 md:min-w-48" disabled={placing} onClick={place}>{placing && <Spinner className="size-4" />} Đặt hàng</button>
        </div>
      </div>

      <Modal open={addrModal} onClose={() => { setAddrModal(false); setAdding(false) }} title={adding ? 'Địa chỉ mới' : 'Địa chỉ của tôi'} wide>
        {adding || !list.length ? (
          <AddressForm onCancel={list.length ? () => setAdding(false) : undefined}
            onSaved={async () => { setAdding(false); const data = await addresses.reload(); if (data?.length) setAddressId(data[data.length - 1].id); setAddrModal(false) }} />
        ) : (
          <>
            <div className="divide-y divide-line" role="radiogroup">
              {list.map((a) => (
                <button key={a.id} role="radio" aria-checked={addressId === a.id} onClick={() => { setAddressId(a.id); setAddrModal(false) }} className="flex w-full gap-3 py-3 text-left text-[13px]">
                  <span className={cx('mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border', addressId === a.id ? 'border-brand' : 'border-line')}>{addressId === a.id && <span className="size-2.5 rounded-full bg-brand" />}</span>
                  <span>
                    <span className="font-semibold">{a.fullname}</span> <span className="text-muted">| {a.phone}</span>
                    <span className="mt-0.5 block text-ink-soft">{fullAddress(a)}</span>
                    {a.primaryAddres && <span className="mt-1 inline-block border border-brand px-1 text-[11px] text-brand">Mặc định</span>}
                  </span>
                </button>
              ))}
            </div>
            <button className="btn btn-outline mt-4 w-full" onClick={() => setAdding(true)}>+ Thêm địa chỉ mới</button>
          </>
        )}
      </Modal>
    </div>
  )
}
