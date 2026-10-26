import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { api } from '../../lib/api'
import { useCart } from '../../lib/cart'
import { useDocumentTitle } from '../../lib/hooks'
import { formatMoney } from '../../lib/format'
import { PageLoader } from '../../components/ui'

/** Cổng VNPay / MoMo chuyển khách về đây; backend tự hỏi lại cổng để xác minh. */
export default function PaymentResult() {
  useDocumentTitle('Kết quả thanh toán')
  const [params] = useSearchParams()
  const cart = useCart()
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    const isVnp = params.has('vnp_TxnRef')
    const body = isVnp
      ? { vnpQuery: window.location.search.slice(1) }
      : { orderId: params.get('orderId'), requestId: params.get('requestId') }
    api.post('/api/invoice/user/payment-return', body)
      .then((invoice) => { setState({ loading: false, invoice }); cart.refresh() })
      .catch((error) => setState({ loading: false, error }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state.loading) return <PageLoader label="Đang xác nhận thanh toán…" />
  const inv = state.invoice
  const ok = inv?.paid
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-lg text-center">
        {ok ? <CheckCircle2 className="mx-auto size-16 text-success" /> : <XCircle className="mx-auto size-16 text-danger" />}
        <h1 className="mt-5 text-2xl font-semibold">{ok ? 'Thanh toán thành công' : 'Chưa thanh toán được'}</h1>
        <p className="mt-3 text-ink-soft">
          {state.error ? state.error.message
            : ok ? `Đơn #${inv.id} (${formatMoney(inv.payableAmount)}) đã được ghi nhận. Shop sẽ xác nhận và giao hàng sớm.`
              : `Giao dịch cho đơn #${inv.id} chưa hoàn tất. Đơn vẫn được giữ trong 30 phút để bạn thanh toán lại.`}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {inv && <Link to={`/account/orders/${inv.id}`} className="btn btn-primary">{ok ? 'Xem đơn hàng' : 'Thanh toán lại'}</Link>}
          <Link to="/products" className="btn btn-outline">Tiếp tục mua sắm</Link>
        </div>
      </div>
    </div>
  )
}
