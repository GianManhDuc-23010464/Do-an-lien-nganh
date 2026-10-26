import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useDebounced, useFetch, useDocumentTitle } from '../../lib/hooks'
import { formatDateTime, formatMoney } from '../../lib/format'
import { PageHeader, Panel, Table } from '../../components/admin/kit'
import { Field, Modal, Pagination, Spinner, useConfirm } from '../../components/ui'

export default function Imports() {
  useDocumentTitle('Nhập hàng')
  const confirm = useConfirm()
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState(0)
  const [range, setRange] = useState({ from: '', to: '' })
  const list = useFetch(() => api.get('/api/import-product/admin/findByProductAndDate', {
    from: range.from && range.to ? range.from : '', to: range.from && range.to ? range.to : '', page, size: 15, sort: 'id,desc',
  }), [page, range.from, range.to])
  const creating = params.get('new') === '1'
  const closeCreate = () => { params.delete('new'); params.delete('productId'); setParams(params) }

  const remove = async (r) => {
    if (!(await confirm({ title: 'Xóa phiếu nhập?', message: `Tồn kho của ${r.productName} (${r.colorName}, ${r.productSize?.sizeName}) sẽ giảm ${r.quantity}.`, danger: true, confirmText: 'Xóa phiếu' }))) return
    try { await api.del('/api/import-product/admin/delete', { id: r.id }); toast.success('Đã xóa phiếu nhập'); list.reload() } catch (e) { toast.error(e.message) }
  }

  const columns = [
    { key: 'p', title: 'Sản phẩm', render: (r) => <><p className="font-medium">{r.productName}</p><p className="text-xs text-muted">{r.colorName}, size {r.productSize?.sizeName}</p></> },
    { key: 'q', title: 'Số lượng', render: (r) => <span className="font-semibold">+{r.quantity}</span> },
    { key: 'price', title: 'Giá nhập', render: (r) => formatMoney(r.importPrice) },
    { key: 'sum', title: 'Thành tiền', render: (r) => formatMoney((r.importPrice || 0) * r.quantity) },
    { key: 'd', title: 'Thời gian', render: (r) => <span className="text-ink-soft">{formatDateTime(r.importDate, r.importTime)}</span> },
    { key: 'note', title: 'Ghi chú', render: (r) => <span className="line-clamp-1 text-ink-soft">{r.description}</span> },
    { key: 'act', title: '', className: 'w-12 text-right', render: (r) => <button className="btn btn-ghost btn-sm px-2 text-danger" onClick={() => remove(r)} aria-label="Xóa"><Trash2 className="size-4" /></button> },
  ]

  return (
    <>
      <PageHeader title="Nhập hàng" description="Mỗi phiếu nhập cộng thêm tồn kho cho một size." actions={<button className="btn btn-primary btn-sm" onClick={() => setParams({ new: '1' })}><Plus className="size-4" /> Tạo phiếu nhập</button>} />
      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 text-sm text-muted">
          <label className="flex items-center gap-2">Từ <input type="date" className="field h-9 w-auto text-sm" value={range.from} onChange={(e) => { setRange({ ...range, from: e.target.value }); setPage(0) }} /></label>
          <label className="flex items-center gap-2">đến <input type="date" className="field h-9 w-auto text-sm" value={range.to} onChange={(e) => { setRange({ ...range, to: e.target.value }); setPage(0) }} /></label>
        </div>
        <Table columns={columns} rows={list.data?.content} loading={list.loading} empty="Chưa có phiếu nhập" />
      </Panel>
      <Pagination page={page} totalPages={list.data?.totalPages} onChange={setPage} />
      {creating && <ImportModal productId={params.get('productId')} onClose={closeCreate} onSaved={() => { closeCreate(); list.reload() }} />}
    </>
  )
}

function ImportModal({ productId, onClose, onSaved }) {
  const [q, setQ] = useState('')
  const dq = useDebounced(q)
  const results = useFetch(() => api.post('/api/product/admin/search', [], { keyword: dq, page: 0, size: 8 }), [dq])
  const [product, setProduct] = useState(null)
  const [colorId, setColorId] = useState('')
  const [sizeId, setSizeId] = useState('')
  const [f, setF] = useState({ quantity: 10, importPrice: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (productId) api.get('/api/product/admin/findById', { id: productId }).then(setProduct).catch(() => {})
  }, [productId])

  const color = product?.productColors?.find((c) => c.id === Number(colorId))
  const save = async () => {
    if (!sizeId) return toast.error('Chọn sản phẩm, màu và size')
    if (!(Number(f.quantity) >= 1)) return toast.error('Số lượng nhập tối thiểu là 1')
    setSaving(true)
    try {
      await api.post('/api/import-product/admin/create', { productSize: { id: Number(sizeId) }, quantity: Number(f.quantity), importPrice: Number(f.importPrice) || 0, description: f.description })
      toast.success('Đã nhập hàng')
      onSaved()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  return (
    <Modal open onClose={onClose} title="Tạo phiếu nhập"
      footer={<><button className="btn btn-ghost" onClick={onClose}>Hủy</button><button className="btn btn-dark" onClick={save} disabled={saving}>{saving && <Spinner className="size-4" />} Nhập hàng</button></>}>
      {!product ? (
        <>
          <Field label="Chọn sản phẩm"><input className="field" placeholder="Gõ tên sản phẩm" value={q} onChange={(e) => setQ(e.target.value)} autoFocus /></Field>
          <ul className="mt-2 max-h-72 divide-y divide-line overflow-y-auto rounded-sm border border-line">
            {(results.data?.content || []).map((p) => (
              <li key={p.id}><button className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-mist" onClick={() => setProduct(p)}>
                <img src={p.imageBanner || '/placeholder.svg'} alt="" className="size-9 rounded-sm object-cover" /> <span className="flex-1">{p.name}</span> <span className="text-muted">tồn {p.stock}</span>
              </button></li>
            ))}
          </ul>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-sm bg-mist p-3">
            <img src={product.imageBanner || '/placeholder.svg'} alt="" className="size-10 rounded-sm object-cover" />
            <span className="flex-1 text-sm font-medium">{product.name}</span>
            <button className="text-sm font-semibold text-ink" onClick={() => { setProduct(null); setColorId(''); setSizeId('') }}>Đổi</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Màu">
              <select className="field" value={colorId} onChange={(e) => { setColorId(e.target.value); setSizeId('') }}>
                <option value="">Chọn màu</option>
                {(product.productColors || []).map((c) => <option key={c.id} value={c.id}>{c.colorName}</option>)}
              </select>
            </Field>
            <Field label="Size">
              <select className="field" value={sizeId} disabled={!color} onChange={(e) => setSizeId(e.target.value)}>
                <option value="">Chọn size</option>
                {(color?.productSizes || []).map((s) => <option key={s.id} value={s.id}>{s.sizeName} (đang có {s.quantity})</option>)}
              </select>
            </Field>
            <Field label="Số lượng nhập"><input className="field" type="number" min="1" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} /></Field>
            <Field label="Giá nhập / sản phẩm (đ)"><input className="field" type="number" min="0" step="1000" value={f.importPrice} onChange={(e) => setF({ ...f, importPrice: e.target.value })} /></Field>
          </div>
          <Field label="Ghi chú"><input className="field" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Nhà cung cấp, số hóa đơn…" /></Field>
        </div>
      )}
    </Modal>
  )
}
