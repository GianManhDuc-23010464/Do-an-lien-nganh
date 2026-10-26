import { Link } from 'react-router-dom'
import { discountPercent, formatMoney, productImage } from '../../lib/format'

export default function ProductCard({ product }) {
  const soldOut = product.stock === 0
  const pct = discountPercent(product.price, product.oldPrice)
  const colors = product.productColors || []
  const second = product.productImages?.find((i) => i.linkImage !== product.imageBanner)?.linkImage
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-mist">
        <img src={productImage(product)} alt={product.name} loading="lazy" className="size-full object-cover"
          onError={(e) => { e.currentTarget.src = '/placeholder.svg' }} />
        {second && <img src={second} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
        {soldOut && <span className="sticker absolute left-0 top-0 bg-ink text-white">Hết hàng</span>}
        {!soldOut && pct > 0 && <span className="sticker absolute left-0 top-0 bg-brand text-white">-{pct}%</span>}
      </div>
      <div className="pt-3">
        {colors.length > 0 && (
          <div className="mb-1.5 flex gap-1" aria-label={`${colors.length} màu`}>
            {colors.slice(0, 5).map((c) => (
              <span key={c.id} className="size-3.5 overflow-hidden rounded-full border border-line" title={c.colorName}>
                <img src={c.linkImage || '/placeholder.svg'} alt="" className="size-full object-cover" />
              </span>
            ))}
          </div>
        )}
        <h3 className="line-clamp-2 text-[13px] leading-snug text-ink group-hover:underline">{product.name}</h3>
        <p className="mt-1 text-sm">
          <span className={pct ? 'font-semibold text-brand' : 'font-semibold'}>{formatMoney(product.price)}</span>
          {pct > 0 && <s className="ml-2 text-xs text-muted">{formatMoney(product.oldPrice)}</s>}
        </p>
      </div>
    </Link>
  )
}

export function ProductGrid({ products, cols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' }) {
  return <div className={`grid gap-x-3 gap-y-8 sm:gap-x-5 ${cols}`}>{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
}

export function ProductGridSkeleton({ n = 8, cols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' }) {
  return (
    <div className={`grid gap-x-3 gap-y-8 sm:gap-x-5 ${cols}`}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-mist" />
          <div className="mt-3 h-3 w-3/4 bg-mist" />
          <div className="mt-2 h-3 w-1/3 bg-mist" />
        </div>
      ))}
    </div>
  )
}
