import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { useCart } from '../../lib/cart'
import { STATUS } from '../../lib/format'
import { useConfirm } from '../ui'

/** Các thao tác trên một đơn mua, giống app mua sắm. */
export function useOrderActions(onChanged) {
  const navigate = useNavigate()
  const cart = useCart()
  const confirm = useConfirm()
  const [busy, setBusy] = useState(null)

  const wrap = (key, fn) => async (...args) => {
    setBusy(key)
    try { await fn(...args) } catch (e) { toast.error(e.message) } finally { setBusy(null) }
  }

  const cancel = wrap('cancel', async (o) => {
    if (!(await confirm({ title: `Hủy đơn #${o.id}?`, message: 'Sản phẩm sẽ được trả về kho. Bạn không thể hoàn tác.', danger: true, confirmText: 'Hủy đơn', cancelText: 'Không' }))) return
    await api.post('/api/invoice/user/cancel-invoice', undefined, { idInvoice: o.id })
    toast.success('Đã hủy đơn hàng')
    onChanged?.()
  })

  const pay = wrap('pay', async (o) => {
    const res = await api.post('/api/invoice/user/retry-payment', undefined, { idInvoice: o.id, returnUrl: window.location.origin + '/payment/result' })
    window.location.href = res.paymentUrl
  })

  const received = wrap('received', async (o) => {
    if (!(await confirm({ title: 'Đã nhận được hàng?', message: 'Xác nhận bạn đã nhận đủ hàng và hài lòng với sản phẩm.', confirmText: 'Đã nhận' }))) return
    await api.post('/api/invoice/user/confirm-received', undefined, { idInvoice: o.id })
    toast.success('Cảm ơn bạn! Hãy để lại đánh giá cho sản phẩm nhé')
    onChanged?.()
  })

  const buyAgain = wrap('again', async (items) => {
    const ok = []
    for (const d of items) {
      if (!d.productSize?.id) continue
      try { await api.post('/api/cart/user/add', { productSizeId: d.productSize.id, quantity: 1 }); ok.push(d.productSize.id) } catch { /* hết hàng */ }
    }
    await cart.refresh()
    if (!ok.length) return toast.error('Các sản phẩm trong đơn đã hết hàng')
    cart.selectOnly(ok)
    navigate('/cart')
  })

  const review = (items) => {
    const pid = items?.[0]?.product?.id
    if (pid) navigate(`/product/${pid}#reviews`)
  }

  return { busy, cancel, pay, received, buyAgain, review }
}

/** Những nút hiển thị theo trạng thái đơn */
export function orderButtons(o) {
  const s = o.status?.id
  if (s === STATUS.AWAITING_PAYMENT && !o.paid) return ['cancel', 'pay']
  if (s === STATUS.PENDING) return o.cancelable ? ['cancel'] : []
  if (s === STATUS.SHIPPING) return ['received']
  if (s === STATUS.RECEIVED) return ['again', 'review']
  if (s === STATUS.CANCELLED || s === STATUS.REFUSED) return ['again']
  return []
}

export const BUTTON_LABEL = { cancel: 'Hủy đơn', pay: 'Thanh toán ngay', received: 'Đã nhận được hàng', again: 'Mua lại', review: 'Đánh giá' }
export const PRIMARY = new Set(['pay', 'received', 'review'])
