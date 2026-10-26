import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ImagePlus, ShoppingBag, Trash2 } from 'lucide-react'
import { api, uploadImages } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useCart } from '../../lib/cart'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { discountPercent, formatDate, formatMoney } from '../../lib/format'
import { safeHtml } from '../../lib/sanitize'
import { ProductGrid } from '../../components/shop/ProductCard'
import VariantSheet, { SizeButtons } from '../../components/shop/VariantSheet'
import { ErrorState, PageLoader, QuantityInput, Spinner, Stars, cx, useConfirm } from '../../components/ui'

export default function ProductDetail() {
  const { id } = useParams()
  const { data: product, loading, error, reload } = useFetch(() => api.get('/api/product/public/findById', { id }), [id])
  useDocumentTitle(product?.name)
  if (loading) return <PageLoader />
  if (error) return <ErrorState error={error} onRetry={reload} />
  return <Detail key={product.id} product={product} />
}

function Detail({ product }) {
  const navigate = useNavigate()
  const cart = useCart()
  const { isAdmin } = useAuth()
  const colors = product.productColors || []
  const [color, setColor] = useState(colors[0] || null)
  const [sizes, setSizes] = useState(colors[0]?.productSizes || [])
  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [busy, setBusy] = useState(false)
  const [sheet, setSheet] = useState(null) // 'cart' | 'buy' | null (chỉ dùng trên điện thoại)

  const gallery = useMemo(() => {
    const list = [product.imageBanner, ...(product.productImages || []).map((i) => i.linkImage)].filter(Boolean)
    return [...new Set(list)]
  }, [product])
  const [image, setImage] = useState(gallery[0])

  useEffect(() => {
    if (!color) return
    setSize(null)
    setQty(1)
    if (color.linkImage) setImage(color.linkImage)
    if (color.productSizes?.length) setSizes(color.productSizes)
    else api.get('/api/product-size/public/find-by-product-color', { idProColor: color.id }).then((s) => setSizes(s || [])).catch(() => setSizes([]))
  }, [color])

  // Thêm vào giỏ / Mua ngay — "Mua ngay" chỉ chọn đúng món này rồi sang trang thanh toán (giống các app mua sắm)
  const submit = async (mode, pick) => {
    const c = pick?.color || color
    const s = pick?.size || size
    const q = pick?.quantity || qty
    if (!s) return toast.error('Vui lòng chọn phân loại hàng')
    setBusy(true)
    try {
      await cart.add(product, c, s, q)
      setSheet(null)
      if (mode === 'buy') {
        cart.selectOnly([s.id])
        navigate('/checkout')
      } else {
        toast.success('Đã thêm vào giỏ hàng', { action: { label: 'Xem giỏ', onClick: () => navigate('/cart') } })
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const categoryId = product.productCategories?.[0]?.category?.id
  const related = useFetch(() => categoryId
    ? api.post('/api/product/public/searchFull', [categoryId], { page: 0, size: 6, sort: 'quantitySold,desc' })
    : Promise.resolve(null), [categoryId])
  const pct = discountPercent(product.price, product.oldPrice)
  // Giá hiển thị theo biến thể đang chọn (nếu biến thể có giá riêng).
  const unitPrice = size?.effectivePrice ?? product.price

  return (
    <div className="container-x pb-24 pt-4 md:pb-0">
      <nav className="mb-4 text-xs text-muted" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">Trang chủ</Link> <span aria-hidden="true">/</span>{' '}
        {product.productCategories?.[0] ? <Link to={`/products?category=${categoryId}`} className="hover:text-ink">{product.productCategories[0].category.name}</Link> : <Link to="/products" className="hover:text-ink">Sản phẩm</Link>}
        {' '}<span aria-hidden="true">/</span> <span className="text-ink-soft">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div>
          <div className="relative aspect-square overflow-hidden bg-mist">
            <img src={image || '/placeholder.svg'} alt={product.name} className="size-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg' }} />
          </div>
          {gallery.length > 1 && (
            <div className="mt-2 grid grid-cols-5 gap-2">
              {gallery.slice(0, 5).map((g) => (
                <button key={g} onClick={() => setImage(g)} className={cx('aspect-square overflow-hidden border', image === g ? 'border-ink' : 'border-transparent')} aria-label="Xem ảnh">
                  <img src={g} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-xl font-medium leading-snug md:text-2xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
            {product.reviewCount > 0 && <a href="#reviews" className="flex items-center gap-1.5 hover:text-ink"><span className="text-ink underline">{product.avgStar}</span> <Stars value={product.avgStar} size="size-3.5" /></a>}
            {product.reviewCount > 0 && <span><span className="text-ink">{product.reviewCount}</span> đánh giá</span>}
            <span>Đã bán <span className="text-ink">{product.quantitySold || 0}</span></span>
            <span>Mã {product.code}</span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3 bg-mist px-4 py-3">
            {pct > 0 && <s className="text-sm text-muted">{formatMoney(product.oldPrice)}</s>}
            <span className="text-2xl font-semibold text-brand">{formatMoney(unitPrice)}</span>
            {pct > 0 && <span className="bg-brand px-1.5 text-xs font-semibold text-white">-{pct}%</span>}
          </div>

          <dl className="mt-5 grid grid-cols-[88px_1fr] gap-y-3 text-[13px]">
            <dt className="text-muted">Vận chuyển</dt><dd>Phí 20.000đ, nhận hàng sau 2–5 ngày</dd>
            <dt className="text-muted">Đổi trả</dt><dd>Đổi size miễn phí trong 7 ngày</dd>
          </dl>

          {/* Chọn phân loại ngay trên trang (màn hình lớn) */}
          <div className="mt-6 hidden space-y-5 md:block">
            {colors.length > 0 && (
              <div className="grid grid-cols-[88px_1fr] items-start gap-3 text-[13px]">
                <span className="pt-2 text-muted">Màu sắc</span>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button key={c.id} onClick={() => setColor(c)} aria-pressed={color?.id === c.id}
                      className={cx('flex items-center gap-2 border px-2 py-1', color?.id === c.id ? 'border-brand text-brand' : 'border-line hover:border-ink')}>
                      <img src={c.linkImage || '/placeholder.svg'} alt="" className="size-6 object-cover" /> {c.colorName}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-[88px_1fr] items-start gap-3 text-[13px]">
              <span className="pt-2 text-muted">Size</span>
              <SizeButtons sizes={sizes} value={size} onChange={(s) => { setSize(s); setQty(1) }} />
            </div>
            <div className="grid grid-cols-[88px_1fr] items-center gap-3 text-[13px]">
              <span className="text-muted">Số lượng</span>
              <div className="flex items-center gap-3">
                <QuantityInput small value={qty} onChange={setQty} max={size?.quantity || 1} />
                <span className="text-muted">{size ? `${size.quantity} sản phẩm có sẵn` : ''}</span>
              </div>
            </div>
            {!isAdmin && (
              <div className="flex gap-3 pt-2">
                <button className="btn btn-brand-outline btn-lg flex-1" disabled={busy} onClick={() => submit('cart')}><ShoppingBag className="size-5" /> Thêm vào giỏ hàng</button>
                <button className="btn btn-primary btn-lg flex-1" disabled={busy} onClick={() => submit('buy')}>Mua ngay</button>
              </div>
            )}
          </div>

          {/* Điện thoại: bấm vào để mở bảng chọn phân loại */}
          <button className="mt-5 flex w-full items-center justify-between border-y border-line py-3 text-left text-[13px] md:hidden" onClick={() => setSheet('cart')}>
            <span><span className="text-muted">Phân loại</span> <span className="ml-3">{colors.length} màu, {sizes.length} size</span></span>
            <span className="text-muted">Chọn</span>
          </button>
        </div>
      </div>

      {product.description && (
        <section className="mt-12 max-w-3xl">
          <h2 className="border-b border-line pb-3 text-base font-semibold">Chi tiết sản phẩm</h2>
          <div className="prose-content mt-4 text-[14px]" dangerouslySetInnerHTML={safeHtml(product.description)} />
        </section>
      )}

      <Reviews productId={product.id} />

      {related.data?.content?.filter((p) => p.id !== product.id).length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 border-b border-line pb-3 text-base font-semibold">Sản phẩm tương tự</h2>
          <ProductGrid products={related.data.content.filter((p) => p.id !== product.id).slice(0, 5)} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
        </section>
      )}

      {/* Thanh hành động cố định ở đáy (điện thoại) */}
      {!isAdmin && (
        <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
          <button className="flex h-12 items-center justify-center gap-2 bg-brand-soft text-[13px] font-medium text-brand" onClick={() => setSheet('cart')}><ShoppingBag className="size-5" /> Thêm vào giỏ</button>
          <button className="h-12 bg-brand text-[13px] font-medium text-white" onClick={() => setSheet('buy')}>Mua ngay</button>
        </div>
      )}
      <VariantSheet open={!!sheet} mode={sheet} product={product} initial={{ color, size, quantity: qty }} onClose={() => setSheet(null)}
        onConfirm={(pick) => submit(sheet, pick)} />
    </div>
  )
}

function Reviews({ productId }) {
  const { isLoggedIn, isAdmin } = useAuth()
  const confirm = useConfirm()
  const list = useFetch(() => api.get('/api/product-comment/public/find-by-product', { idproduct: productId }), [productId])
  const can = useFetch(() => (isLoggedIn && !isAdmin ? api.get('/api/product-comment/user/can-review', { idproduct: productId }) : Promise.resolve(false)), [productId, isLoggedIn])
  const [star, setStar] = useState(5)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [sending, setSending] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return toast.error('Hãy viết vài dòng nhận xét')
    setSending(true)
    try {
      const links = await uploadImages(files)
      await api.post('/api/product-comment/user/create', { star, content, product: { id: productId }, listLink: links })
      setContent(''); setFiles([]); setStar(5)
      toast.success('Đã gửi đánh giá')
      list.reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  const remove = async (id) => {
    if (!(await confirm({ title: 'Xóa đánh giá?', message: 'Đánh giá này sẽ bị xóa vĩnh viễn.', danger: true, confirmText: 'Xóa' }))) return
    try { await api.del('/api/product-comment/user/delete', { id }); list.reload() } catch (e) { toast.error(e.message) }
  }

  const reviews = list.data || []
  return (
    <section id="reviews" className="mt-12 max-w-3xl scroll-mt-24">
      <h2 className="border-b border-line pb-3 text-base font-semibold">Đánh giá sản phẩm ({reviews.length})</h2>

      {can.data === true && (
        <form onSubmit={submit} className="mt-5 border border-line p-5">
          <p className="font-semibold">Bạn thấy sản phẩm thế nào?</p>
          <div className="mt-2"><Stars value={star} onChange={setStar} size="size-7" /></div>
          <textarea className="field mt-3" rows={3} placeholder="Chất vải, form dáng, size có chuẩn không…" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="btn btn-ghost btn-sm cursor-pointer">
              <ImagePlus className="size-4" /> {files.length ? `${files.length} ảnh` : 'Thêm ảnh'}
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))} />
            </label>
            <button className="btn btn-dark btn-sm" disabled={sending}>{sending && <Spinner className="size-4" />} Gửi đánh giá</button>
          </div>
        </form>
      )}
      {isLoggedIn && !isAdmin && can.data === false && (
        <p className="mt-3 text-sm text-muted">Bạn có thể đánh giá sau khi đã nhận được sản phẩm này.</p>
      )}

      <div className="mt-6 divide-y divide-line">
        {reviews.length === 0 && <p className="py-4 text-muted">Chưa có đánh giá nào.</p>}
        {reviews.map((r) => (
          <article key={r.id} className="py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-mist font-semibold text-ink-soft">{(r.user?.fullname || '?')[0]}</span>
                <div>
                  <p className="font-semibold">{r.user?.fullname || 'Khách hàng'}</p>
                  <div className="flex items-center gap-2 text-xs text-muted"><Stars value={r.star} size="size-3.5" /> {formatDate(r.createdDate)}</div>
                </div>
              </div>
              {r.isMyComment && <button className="btn btn-ghost btn-sm px-2 text-danger" onClick={() => remove(r.id)} aria-label="Xóa đánh giá"><Trash2 className="size-4" /></button>}
            </div>
            <p className="mt-3 whitespace-pre-line text-ink-soft">{r.content}</p>
            {r.productCommentImages?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.productCommentImages.map((img) => (
                  <a key={img.id} href={img.linkImage} target="_blank" rel="noreferrer"><img src={img.linkImage} alt="Ảnh đánh giá" className="size-20 rounded-sm object-cover" /></a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
