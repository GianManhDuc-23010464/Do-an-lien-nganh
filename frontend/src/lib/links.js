/** Link của banner: ưu tiên sản phẩm gắn kèm, sau đó link tùy chỉnh (hỗ trợ cả link kiểu cũ "detail?id=12"). */
export function bannerLink(b) {
  if (b?.idProduct) return `/product/${b.idProduct}`
  const link = b?.linkWeb || ''
  const old = link.match(/^\/?detail\?id=(\d+)/)
  if (old) return `/product/${old[1]}`
  const blog = link.match(/^\/?blogdetail\?id=(\d+)/)
  if (blog) return `/blog/${blog[1]}`
  return link || '/products'
}
