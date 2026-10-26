import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { bannerLink } from '../../lib/links'
import { formatDate } from '../../lib/format'
import { ProductGrid, ProductGridSkeleton } from '../../components/shop/ProductCard'
import { cx } from '../../components/ui'

// Ảnh mộc, trung tính dùng tạm cho hero/editorial (ảnh thật, grayscale).
const img = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}?grayscale`

export default function Home() {
  useDocumentTitle()
  const banners = useFetch(() => api.get('/api/banner/public/find-by-page', { page: 'index' }), [])
  const categories = useFetch(() => api.get('/api/category/public/findPrimaryCategory'), [])
  const fresh = useFetch(() => api.post('/api/product/public/searchFull', [], { page: 0, size: 8, sort: 'id,desc' }), [])
  const best = useFetch(() => api.post('/api/product/public/searchFull', [], { page: 0, size: 8, sort: 'quantitySold,desc' }), [])
  const blogs = useFetch(() => api.get('/api/blog/public/findAll', { page: 0, size: 3, sort: 'id,desc' }), [])

  const top = (banners.data || []).filter((b) => b.bannerType === 'TOP')
  const promo = (banners.data || []).find((b) => b.bannerType === 'NORMAL')

  return (
    <>
      <Hero banners={top} />

      {categories.data?.length > 0 && (
        <section className="container-x mt-16">
          <ul className="grid grid-cols-3 gap-5 sm:grid-cols-6 sm:gap-6">
            {categories.data.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/products?category=${c.id}`} className="group block text-center">
                  <span className="block aspect-square overflow-hidden bg-mist">
                    <img src={c.imageBanner || '/placeholder.svg'} alt="" loading="lazy"
                      className="size-full object-cover transition-opacity group-hover:opacity-90" />
                  </span>
                  <span className="mt-2.5 block text-[12px] tracking-wide text-ink-soft group-hover:text-brand">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Section title="Hàng mới về" to="/products?sort=new">
        {fresh.loading ? <ProductGridSkeleton /> : <ProductGrid products={fresh.data?.content || []} />}
      </Section>

      <section className="container-x mt-20">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <img src={img('madu-story', 1000, 800)} alt="" loading="lazy" className="aspect-[5/4] w-full object-cover" />
          <div className="max-w-[46ch]">
            <h2 className="section-title">Vừa đủ tốt</h2>
            <p className="mt-4 leading-loose text-ink-soft">
              MADU làm những món dùng được lâu: vải mộc, dáng cơ bản, bỏ đi phần thừa.
              Không chạy theo mùa vụ, chỉ giữ lại thứ bạn thật sự cần mỗi ngày.
            </p>
            <Link to="/products" className="btn btn-outline btn-sm mt-6">Xem sản phẩm</Link>
          </div>
        </div>
      </section>

      {promo && (
        <section className="container-x mt-20">
          <Link to={bannerLink(promo)} className="block bg-mist">
            <img src={promo.image} alt="Ưu đãi" className="max-h-[360px] w-full object-cover" loading="lazy" />
          </Link>
        </section>
      )}

      <Section title="Được mua nhiều" to="/products?sort=best">
        {best.loading ? <ProductGridSkeleton /> : <ProductGrid products={best.data?.content || []} />}
      </Section>

      <section className="container-x mt-20">
        <div className="grid gap-10 border-t border-line pt-10 text-center sm:grid-cols-3">
          {[
            ['Giao 20.000đ mọi đơn', 'Đồng giá toàn quốc, nhận hàng sau 2–5 ngày'],
            ['Đổi size trong 7 ngày', 'Còn tem mác là đổi miễn phí, không hỏi lý do'],
            ['Xem hàng khi nhận', 'Mở hộp kiểm tra rồi mới thanh toán'],
          ].map(([t, d]) => (
            <div key={t}>
              <p className="font-medium text-ink">{t}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {blogs.data?.content?.length > 0 && (
        <Section title="Nhật ký MADU" to="/blog">
          <div className="grid gap-8 md:grid-cols-3">
            {blogs.data.content.map((b) => (
              <Link key={b.id} to={`/blog/${b.id}`} className="group">
                <div className="aspect-[3/2] overflow-hidden bg-mist"><img src={b.imageBanner || '/placeholder.svg'} alt="" className="size-full object-cover transition-opacity group-hover:opacity-90" loading="lazy" /></div>
                <p className="mt-3 text-xs text-muted">{formatDate(b.createdDate)}</p>
                <h3 className="mt-1 text-[14px] font-medium leading-snug group-hover:text-brand">{b.title}</h3>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  )
}

/* Hero yên tĩnh: ảnh lớn dẫn dắt, chữ nhỏ canh giữa phía dưới. */
function Hero({ banners }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (banners.length < 2) return
    const t = setInterval(() => setI((v) => (v + 1) % banners.length), 6000)
    return () => clearInterval(t)
  }, [banners.length])
  const current = banners[i]
  const image = current?.image || img('madu-hero', 1680, 760)

  return (
    <section>
      <div className="relative bg-mist">
        {current ? (
          <Link to={bannerLink(current)} aria-label="Xem ưu đãi" className="block">
            <img src={image} alt="" className="aspect-[16/10] w-full object-cover sm:aspect-[21/9]" />
          </Link>
        ) : (
          <img src={image} alt="" className="aspect-[16/10] w-full object-cover sm:aspect-[21/9]" />
        )}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((b, idx) => (
              <button key={b.id} onClick={() => setI(idx)} aria-label={`Banner ${idx + 1}`}
                className={cx('h-[3px] w-8 transition-colors', idx === i ? 'bg-ink' : 'bg-ink/30')} />
            ))}
          </div>
        )}
      </div>
      <div className="container-x py-10 text-center sm:py-12">
        <h1 className="text-xl font-medium tracking-wide text-ink">Đồ dùng mỗi ngày, làm vừa đủ tốt</h1>
        <p className="mx-auto mt-3 max-w-[48ch] leading-relaxed text-ink-soft">
          Vải mộc, dáng cơ bản, giá hợp lý — những món bền và dễ dùng cho đời sống thường ngày.
        </p>
        <Link to="/products" className="btn btn-outline mt-6">Xem tất cả sản phẩm</Link>
      </div>
    </section>
  )
}

function Section({ title, to, children }) {
  return (
    <section className="container-x mt-20">
      <div className="mb-8 text-center">
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
      {to && (
        <div className="mt-8 text-center">
          <Link to={to} className="btn btn-outline btn-sm">Xem tất cả</Link>
        </div>
      )}
    </section>
  )
}
