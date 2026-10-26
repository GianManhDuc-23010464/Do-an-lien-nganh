import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { PageLoader, cx } from '../../components/ui'

/** Màn hình danh mục trên điện thoại: nhóm bên trái, danh mục con bên phải (giống app mua sắm) */
export default function Categories() {
  useDocumentTitle('Danh mục')
  const { data, loading } = useFetch(() => api.get('/api/category/public/findAllList'), [])
  const parents = useMemo(() => (data || []).filter((c) => !c.categoryParentId), [data])
  const [active, setActive] = useState(null)
  const current = active ?? parents[0]?.id
  const children = (data || []).filter((c) => c.categoryParentId === current)
  const parent = parents.find((p) => p.id === current)
  if (loading) return <PageLoader />
  return (
    <div className="container-x grid grid-cols-[96px_1fr] gap-0 px-0 sm:grid-cols-[180px_1fr] sm:px-6">
      <nav className="min-h-[70vh] bg-mist" aria-label="Nhóm sản phẩm">
        {parents.map((p) => (
          <button key={p.id} onClick={() => setActive(p.id)} className={cx('block w-full px-3 py-4 text-left text-[13px]', p.id === current ? 'bg-paper font-medium text-brand' : 'text-ink-soft')}>{p.name}</button>
        ))}
      </nav>
      <div className="p-4">
        {parent && <Link to={`/products?category=${parent.id}`} className="mb-4 block text-[13px] text-brand">Xem tất cả {parent.name}</Link>}
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5">
          {children.map((c) => (
            <Link key={c.id} to={`/products?category=${c.id}`} className="text-center text-xs">
              <img src={c.imageBanner || '/placeholder.svg'} alt="" className="mx-auto aspect-square w-full bg-mist object-cover" loading="lazy" />
              <span className="mt-1.5 block">{c.name}</span>
            </Link>
          ))}
          {!children.length && <p className="col-span-3 text-[13px] text-muted">Nhóm này chưa có danh mục con.</p>}
        </div>
      </div>
    </div>
  )
}
