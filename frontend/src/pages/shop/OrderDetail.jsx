import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, MapPin } from 'lucide-react'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { PAY_TYPES, STATUS, STATUS_META, formatDateTime, formatMoney } from '../../lib/format'
import OrderTimeline from '../../components/shop/OrderTimeline'
import { BUTTON_LABEL, PRIMARY, orderButtons, useOrderActions } from '../../components/shop/useOrderActions'
import { ErrorState, PageLoader, Spinner, cx } from '../../components/ui'

const STATUS_HINT = {
  [STATUS.AWAITING_PAYMENT]: 'Đơn hàng sẽ tự hủy nếu chưa thanh toán trong 30 phút kể từ lúc đặt.',
  [STATUS.PENDING]: 'MADU sẽ xác nhận đơn của bạn trong giờ làm việc.',
  [STATUS.CONFIRMED]: 'Đơn đã được xác nhận và đang được đóng gói.',
  [STATUS.SHIPPING]: 'Đơn đang trên đường giao tới bạn. Hãy bấm "Đã nhận được hàng" khi nhận đủ hàng.',
  [STATUS.RECEIVED]: 'Đơn đã giao thành công. Cảm ơn bạn đã mua sắm tại MADU.',
  [STATUS.CANCELLED]: 'Đơn hàng đã bị hủy.',
  [STATUS.REFUSED]: 'Giao hàng không thành công.',
}

export default function OrderDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  useDocumentTitle(`Đơn #${id}`)
  const order = useFetch(() => api.get('/api/invoice/user/find-by-id', { idInvoice: id }), [id])
  const items = useFetch(() => api.get('/api/invoice-detail/user/find-by-invoice', { idInvoice: id }), [id])
  const actions = useOrderActions(order.reload)

  if (order.loading) return <PageLoader />
  if (order.error) return <ErrorState error={order.error} onRetry={order.reload} />
  const o = order.data
  const buttons = orderButtons(o)
  const run = { cancel: () => actions.cancel(o), pay: () => actions.pay(o), received: () => actions.received(o), again: () => actions.buyAgain(items.data || []), review: () => actions.review(items.data) }

  return (
    <div className="pb-24 md:pb-0">
      <Link to="/account/orders" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink"><ArrowLeft className="size-4" /> Đơn mua</Link>

      {params.get('placed') && (
        <div className="mb-3 flex items-center gap-3 border border-success/30 bg-success-soft p-4 text-[13px]">
          <CheckCircle2 className="size-6 shrink-0 text-success" />
          <p><b>Đặt hàng thành công.</b> Email xác nhận đã được gửi cho bạn.</p>
        </div>
      )}

      <div className="bg-ink px-5 py-4 text-white">
        <p className="text-base font-semibold">{STATUS_META[o.status?.id]?.label || o.status?.name}</p>
        <p className="mt-0.5 text-[13px] text-white/75">{STATUS_HINT[o.status?.id]}</p>
      </div>

      <div className="grid gap-3 pt-3 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <section className="border border-line p-4 text-[13px]">
            <p className="flex items-center gap-2 font-semibold"><MapPin className="size-4 text-brand" /> Địa chỉ nhận hàng</p>
            <p className="mt-2">{o.receiverName} <span className="text-muted">| {o.phone}</span></p>
            <p className="text-ink-soft">{o.address}</p>
            {o.note && <p className="mt-2 text-ink-soft">Lời nhắn: {o.note}</p>}
          </section>

          <section className="border border-line">
            <h2 className="border-b border-line px-4 py-3 text-[13px] font-semibold">MADU <span className="font-normal text-muted">Đơn #{o.id}, đặt lúc {formatDateTime(o.createdDate, o.createdTime)}</span></h2>
            {items.loading ? <div className="h-24 animate-pulse bg-mist" /> : (
              <ul className="divide-y divide-line">
                {(items.data || []).map((d) => (
                  <li key={d.id}>
                    <Link to={d.product?.id ? `/product/${d.product.id}` : '#'} className="flex gap-3 px-4 py-3 text-[13px] hover:bg-mist/50">
                      <img src={d.linkImage || '/placeholder.svg'} alt="" className="size-16 shrink-0 bg-mist object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1">{d.productName}</p>
                        <p className="text-xs text-muted">Phân loại: {d.colorName}, {d.productSize?.sizeName}</p>
                        <p className="text-xs">x{d.quantity}</p>
                      </div>
                      <span>{formatMoney(d.price * d.quantity)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <dl className="space-y-1.5 border-t border-line px-4 py-3 text-[13px] text-ink-soft">
              <div className="flex justify-between"><dt>Tổng tiền hàng</dt><dd>{formatMoney((o.totalAmount || 0) + (o.discount || 0))}</dd></div>
              <div className="flex justify-between"><dt>Phí vận chuyển</dt><dd>{formatMoney(o.shippingFee || 0)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between"><dt>Giảm giá voucher</dt><dd>-{formatMoney(o.discount)}</dd></div>}
              <div className="flex justify-between pt-1 text-ink"><dt>Thành tiền</dt><dd className="text-base font-semibold text-brand">{formatMoney(o.payableAmount)}</dd></div>
              <div className="flex justify-between"><dt>Phương thức thanh toán</dt><dd>{PAY_TYPES[o.payType]}{o.paid ? ' (đã thanh toán)' : ''}</dd></div>
            </dl>
          </section>
        </div>

        <section className="h-fit border border-line p-4">
          <h2 className="mb-4 text-[13px] font-semibold">Theo dõi đơn hàng</h2>
          <OrderTimeline order={o} />
        </section>
      </div>

      {buttons.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-end gap-2 border-t border-line bg-paper px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:static md:mt-3 md:border md:px-4">
          {buttons.map((b) => (
            <button key={b} className={cx('btn min-w-32', PRIMARY.has(b) ? 'btn-primary' : 'btn-outline')} disabled={!!actions.busy} onClick={run[b]}>
              {actions.busy === b && <Spinner className="size-4" />} {BUTTON_LABEL[b]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
