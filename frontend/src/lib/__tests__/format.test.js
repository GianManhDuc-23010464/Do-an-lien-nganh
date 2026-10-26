import { describe, expect, it } from 'vitest'
import { discountPercent, formatDate, formatMoney, fullAddress, variantPrice } from '../format'
import { bannerLink } from '../links'

describe('format', () => {
  it('định dạng tiền Việt', () => {
    expect(formatMoney(199000)).toBe('199.000đ')
    expect(formatMoney(null)).toBe('0đ')
  })
  it('định dạng ngày', () => {
    expect(formatDate('2026-10-25')).toBe('25/10/2026')
  })
  it('tính % giảm giá', () => {
    expect(discountPercent(199000, 249000)).toBe(20)
    expect(discountPercent(199000, null)).toBe(0)
    expect(discountPercent(300000, 200000)).toBe(0)
  })
  it('giá biến thể ưu tiên giá riêng rồi mới tới giá sản phẩm', () => {
    expect(variantPrice({ size: { effectivePrice: 150000 }, product: { price: 100000 } })).toBe(150000)
    expect(variantPrice({ size: {}, product: { price: 100000 } })).toBe(100000)
    expect(variantPrice({})).toBe(0)
  })
  it('ghép địa chỉ đầy đủ', () => {
    const a = { streetName: '12 Lê Lợi', wards: { name: 'Bến Nghé', districts: { name: 'Quận 1', province: { name: 'TP.HCM' } } } }
    expect(fullAddress(a)).toBe('12 Lê Lợi, Bến Nghé, Quận 1, TP.HCM')
  })
})

describe('bannerLink', () => {
  it('ưu tiên sản phẩm gắn kèm', () => expect(bannerLink({ idProduct: 5, linkWeb: '/x' })).toBe('/product/5'))
  it('chuyển link kiểu cũ', () => {
    expect(bannerLink({ linkWeb: 'detail?id=12' })).toBe('/product/12')
    expect(bannerLink({ linkWeb: 'blogdetail?id=1' })).toBe('/blog/1')
  })
})
