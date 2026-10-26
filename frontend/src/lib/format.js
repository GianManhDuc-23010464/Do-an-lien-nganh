const money = new Intl.NumberFormat('vi-VN')

export function formatMoney(v) {
  if (v === null || v === undefined || isNaN(v)) return '0đ'
  return money.format(Math.round(v)) + 'đ'
}

export function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = String(d).slice(0, 10).split('-')
  return `${day}/${m}/${y}`
}

export function formatDateTime(date, time) {
  return [time ? String(time).slice(0, 5) : '', formatDate(date)].filter(Boolean).join(' ')
}

export function discountPercent(price, oldPrice) {
  if (!oldPrice || !price || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}

export const PAY_TYPES = {
  PAYMENT_DELIVERY: 'Thanh toán khi nhận hàng',
  PAYMENT_MOMO: 'Ví MoMo',
  PAYMENT_VNPAY: 'VNPay',
}

// Trạng thái đơn hàng (khớp StatusUtils ở backend)
export const STATUS = {
  PENDING: 1, CONFIRMED: 2, SHIPPING: 3, RECEIVED: 4, CANCELLED: 5, REFUSED: 6, AWAITING_PAYMENT: 7,
}

export const STATUS_META = {
  1: { label: 'Chờ xác nhận', tone: 'warning' },
  2: { label: 'Đã xác nhận', tone: 'violet' },
  3: { label: 'Đang giao', tone: 'mango' },
  4: { label: 'Đã nhận hàng', tone: 'success' },
  5: { label: 'Đã hủy', tone: 'muted' },
  6: { label: 'Không nhận hàng', tone: 'danger' },
  7: { label: 'Chờ thanh toán', tone: 'pink' },
}

// Tên hành động admin cho từng trạng thái đích
export const STATUS_ACTION = {
  2: 'Xác nhận đơn',
  3: 'Giao cho vận chuyển',
  4: 'Khách đã nhận',
  5: 'Hủy đơn',
  6: 'Khách không nhận',
}

export function productImage(p) {
  return p?.imageBanner || p?.productImages?.[0]?.linkImage || '/placeholder.svg'
}

export function fullAddress(a) {
  if (!a) return ''
  const w = a.wards
  return [a.streetName, w?.name, w?.districts?.name, w?.districts?.province?.name].filter(Boolean).join(', ')
}
