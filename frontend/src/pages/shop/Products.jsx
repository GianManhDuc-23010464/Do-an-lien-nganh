import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, SearchX, X } from 'lucide-react'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import ProductCard, { ProductGridSkeleton } from '../../components/shop/ProductCard'
import { ErrorState, Empty, Pagination, cx } from '../../components/ui'

const SORTS = {
  new: { label: 'Mới nhất', value: 'id,desc' },
  best: { label: 'Bán chạy', value: 'quantitySold,desc' },
  'price-asc': { label: 'Giá thấp → cao', value: 'price,asc' },
  'price-desc': { label: 'Giá cao → thấp', value: 'price,desc' },
  sale: { label: 'Đang giảm giá', value: 'id,desc', onSale: true },
}

const PRICES = [
  { id: 'u200', label: 'Dưới 200k', min: 0, max: 200000 },
  { id: '200-500', label: '200k – 500k', min: 200000, max: 500000 },
  { id: '500-1m', label: '500k – 1 triệu', min: 500000, max: 1000000 },
  { id: 'o1m', label: 'Trên 1 triệu', min: 1000000, max: 1000000000 },
]

const PAGE_SIZE = 12

export default function Products() {
  const [params, setParams] = useSearchParams()
  const [showFilter, setShowFilter] = useState(false)
  const q = params.get('q') || ''
  const sortKey = SORTS[params.get('sort')] ? params.get('sort') : 'new'
  const categoryIds = params.getAll('category').map(Number)
  const priceId = params.get('price') || ''
  const page = Number(params.get('page') || 0)
  const price = PRICES.find((p) => p.id === priceId)

  const categories = useFetch(() => api.get('/api/category/public/findAllList'), [])
  const tree = useMemo(() => {
    const all = categories.data || []
    return all.filter((c) => !c.categoryParentId).map((parent) => ({ ...parent, children: all.filter((c) => c.categoryParentId === parent.id) }))
  }, [categories.data])

  const key = params.toString()
  const result = useFetch(() => api.post('/api/product/public/searchFull', categoryIds, {
    keyword: q, smallPrice: price?.min, largePrice: price?.max, onSale: SORTS[sortKey].onSale ? true : undefined,
    page, size: PAGE_SIZE, sort: SORTS[sortKey].value,
  }), [key])

  const title = q ? `Kết quả cho “${q}”` : categoryIds.length === 1 ? (categories.data || []).find((c) => c.id === categoryIds[0])?.name || 'Sản phẩm' : 'Tất cả sản phẩm'
  useDocumentTitle(title)

  const update = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([k, v]) => {
      next.delete(k)
      ;[].concat(v ?? []).forEach((x) => x !== '' && next.append(k, x))
    })
    if (!('page' in changes)) next.delete('page')
    setParams(next)
  }
  const toggleCategory = (id) => update({ category: categoryIds.includes(id) ? categoryIds.filter((c) => c !== id) : [...categoryIds, id] })
  const hasFilter = categoryIds.length || priceId || q

  const filters = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-base font-bold">Danh mục</h3>
        <div className="space-y-4">
          {tree.map((parent) => (
            <div key={parent.id}>
              <Check checked={categoryIds.includes(parent.id)} onChange={() => toggleCategory(parent.id)} label={parent.name} strong />
              <div className="ml-6 mt-1.5 space-y-1.5">
                {parent.children.map((c) => <Check key={c.id} checked={categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} label={c.name} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-base font-bold">Khoảng giá</h3>
        <div className="flex flex-wrap gap-2">
          {PRICES.map((p) => (
            <button key={p.id} className={cx('chip', priceId === p.id && 'chip-active')} onClick={() => update({ price: priceId === p.id ? '' : p.id })} aria-pressed={priceId === p.id}>{p.label}</button>
          ))}
        </div>
      </div>
    </div>
  )

  const data = result.data
  return (
    <div className="container-x pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold md:text-[26px]">{title}</h1>
          {data && <p className="mt-2 text-muted">{data.totalElements} sản phẩm</p>}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm lg:hidden" onClick={() => setShowFilter(true)}><SlidersHorizontal className="size-4" /> Bộ lọc</button>
          <label className="sr-only" htmlFor="sort">Sắp xếp</label>
          <select id="sort" className="field h-9 w-auto pr-8 text-sm" value={sortKey} onChange={(e) => update({ sort: e.target.value })}>
            {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {hasFilter ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {q && <Pill onRemove={() => update({ q: '' })}>“{q}”</Pill>}
          {categoryIds.map((id) => <Pill key={id} onRemove={() => toggleCategory(id)}>{(categories.data || []).find((c) => c.id === id)?.name || id}</Pill>)}
          {price && <Pill onRemove={() => update({ price: '' })}>{price.label}</Pill>}
          <button className="text-sm font-semibold text-ink hover:underline" onClick={() => setParams(new URLSearchParams(sortKey !== 'new' ? { sort: sortKey } : {}))}>Xóa bộ lọc</button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>
        <div>
          {result.loading ? <ProductGridSkeleton n={9} /> : result.error ? <ErrorState error={result.error} onRetry={result.reload} /> : !data?.content?.length ? (
            <Empty icon={SearchX} title="Không có sản phẩm phù hợp" action={hasFilter && <button className="btn btn-outline" onClick={() => setParams(new URLSearchParams())}>Xem tất cả sản phẩm</button>}>
              Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa ngắn hơn.
            </Empty>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
                {data.content.map((p, i) => <ProductCard key={p.id} product={p} tilt={i} />)}
              </div>
              <Pagination page={page} totalPages={data.totalPages} onChange={(p) => { update({ page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </>
          )}
        </div>
      </div>

      {showFilter && (
        <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onClick={() => setShowFilter(false)}>
          <div className="absolute bottom-0 max-h-[85vh] w-full overflow-y-auto  bg-paper p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Bộ lọc</h2>
              <button className="btn btn-ghost btn-sm px-2" onClick={() => setShowFilter(false)} aria-label="Đóng"><X className="size-5" /></button>
            </div>
            {filters}
            <button className="btn btn-dark mt-8 w-full" onClick={() => setShowFilter(false)}>Xem {data?.totalElements ?? ''} sản phẩm</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Check({ checked, onChange, label, strong }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-ink" />
      <span className={strong ? 'font-semibold text-ink' : 'text-ink-soft'}>{label}</span>
    </label>
  )
}

function Pill({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-mist py-1 pl-3 pr-1 text-sm font-medium text-ink">
      {children}
      <button onClick={onRemove} className="grid size-6 place-items-center rounded-full hover:bg-ink/15" aria-label="Bỏ lọc"><X className="size-3.5" /></button>
    </span>
  )
}
