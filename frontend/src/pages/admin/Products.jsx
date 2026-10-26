import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useDebounced, useFetch, useDocumentTitle } from '../../lib/hooks'
import { formatMoney, productImage } from '../../lib/format'
import { PageHeader, Panel, SearchBox, Table } from '../../components/admin/kit'
import { Badge, Pagination, cx, useConfirm } from '../../components/ui'

const TABS = [
  ['ALL', 'Tất cả'],
  ['ACTIVE', 'Đang bán'],
  ['OUT_OF_STOCK', 'Hết hàng'],
  ['HIDDEN', 'Đã ẩn'],
]

function StatusCell({ p }) {
  if (p.status === 'HIDDEN') return <Badge tone="muted">Đã ẩn</Badge>
  if (p.status === 'OUT_OF_STOCK' || p.stock === 0) return <Badge tone="danger">Hết hàng</Badge>
  if (p.lowStock) return <Badge tone="warning">Sắp hết</Badge>
  return <Badge tone="success">Đang bán</Badge>
}

export default function Products() {
  useDocumentTitle('Sản phẩm')
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(0)
  const dq = useDebounced(q)
  const query = { keyword: dq, page, size: 15, sort: 'id,desc' }
  if (status !== 'ALL') query.status = status
  const list = useFetch(() => api.post('/api/product/admin/search', [], query), [dq, page, status])

  const remove = async (p) => {
    if (!(await confirm({ title: `Xóa “${p.name}”?`, message: 'Sản phẩm sẽ bị gỡ khỏi cửa hàng. Đơn hàng cũ vẫn giữ thông tin sản phẩm.', danger: true, confirmText: 'Xóa' }))) return
    try { await api.del('/api/product/admin/delete', { id: p.id }); toast.success('Đã xóa sản phẩm'); list.reload() } catch (e) { toast.error(e.message) }
  }

  const toggleVisible = async (p) => {
    const next = p.status === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN'
    try {
      await api.post('/api/product/admin/set-status', undefined, { id: p.id, status: next })
      toast.success(next === 'HIDDEN' ? 'Đã ẩn sản phẩm' : 'Đã hiện lại sản phẩm')
      list.reload()
    } catch (e) { toast.error(e.message) }
  }

  const columns = [
    { key: 'name', title: 'Sản phẩm', render: (p) => (
      <div className="flex items-center gap-3">
        <img src={productImage(p)} alt="" className="size-12 rounded-sm bg-mist object-cover" />
        <div className="min-w-0"><p className="line-clamp-1 font-medium">{p.name}</p><p className="text-xs text-muted">{p.code}</p></div>
      </div>) },
    { key: 'price', title: 'Giá bán', render: (p) => <><p className="font-semibold">{formatMoney(p.price)}</p>{p.oldPrice > p.price && <s className="text-xs text-muted">{formatMoney(p.oldPrice)}</s>}</> },
    { key: 'stock', title: 'Tồn kho', render: (p) => p.stock },
    { key: 'status', title: 'Trạng thái', render: (p) => <StatusCell p={p} /> },
    { key: 'sold', title: 'Đã bán', render: (p) => p.quantitySold || 0 },
    { key: 'act', title: '', className: 'text-right w-32', render: (p) => (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-ghost btn-sm px-2" onClick={() => toggleVisible(p)} aria-label={p.status === 'HIDDEN' ? 'Hiện lại' : 'Ẩn sản phẩm'} title={p.status === 'HIDDEN' ? 'Hiện lại' : 'Ẩn sản phẩm'}>
          {p.status === 'HIDDEN' ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        <Link to={`/admin/products/${p.id}`} className="btn btn-ghost btn-sm px-2" aria-label="Sửa"><Pencil className="size-4" /></Link>
        <button className="btn btn-ghost btn-sm px-2 text-danger" onClick={() => remove(p)} aria-label="Xóa"><Trash2 className="size-4" /></button>
      </div>) },
  ]

  return (
    <>
      <PageHeader title="Sản phẩm" actions={<Link to="/admin/products/new" className="btn btn-primary btn-sm"><Plus className="size-4" /> Thêm sản phẩm</Link>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([v, label]) => <button key={v} className={cx('chip h-8 px-3.5', status === v && 'chip-active')} onClick={() => { setStatus(v); setPage(0) }}>{label}</button>)}
      </div>
      <Panel padded={false}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(0) }} placeholder="Tìm theo tên sản phẩm" />
          {list.data && <span className="text-sm text-muted">{list.data.totalElements} sản phẩm</span>}
        </div>
        <Table columns={columns} rows={list.data?.content} loading={list.loading} onRowClick={(p) => navigate(`/admin/products/${p.id}`)} empty="Không có sản phẩm nào khớp bộ lọc" />
      </Panel>
      <Pagination page={page} totalPages={list.data?.totalPages} onChange={setPage} />
    </>
  )
}
