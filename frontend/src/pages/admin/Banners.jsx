import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { ImageField, PageHeader, Panel, Table } from '../../components/admin/kit'
import { Badge, Field, Modal, Pagination, Spinner, useConfirm } from '../../components/ui'

const TYPES = { TOP: 'Banner lớn đầu trang', NORMAL: 'Banner giữa trang' }

export default function Banners() {
  useDocumentTitle('Banner')
  const confirm = useConfirm()
  const [page, setPage] = useState(0)
  const list = useFetch(() => api.get('/api/banner/public/search', { q: '', page, size: 15, sort: 'id,desc' }), [page])
  const [editing, setEditing] = useState(undefined)
  const remove = async (b) => {
    if (!(await confirm({ title: 'Xóa banner?', message: 'Banner sẽ không còn hiện trên cửa hàng.', danger: true, confirmText: 'Xóa' }))) return
    try { await api.del('/api/banner/admin/delete', { id: b.id }); list.reload() } catch (e) { toast.error(e.message) }
  }
  const columns = [
    { key: 'img', title: 'Ảnh', render: (b) => <img src={b.image} alt="" className="h-14 w-28 rounded-sm object-cover" /> },
    { key: 'type', title: 'Vị trí', render: (b) => <Badge tone={b.bannerType === 'TOP' ? 'violet' : 'mango'}>{TYPES[b.bannerType] || b.bannerType}</Badge> },
    { key: 'page', title: 'Trang', render: (b) => (b.pageName === 'index' ? 'Trang chủ' : b.pageName) },
    { key: 'link', title: 'Dẫn tới', render: (b) => <span className="text-ink-soft">{b.idProduct ? `Sản phẩm #${b.idProduct}` : b.linkWeb || '—'}</span> },
    { key: 'act', title: '', className: 'w-24 text-right', render: (b) => (
      <div className="flex justify-end gap-1">
        <button className="btn btn-ghost btn-sm px-2" onClick={() => setEditing(b)} aria-label="Sửa"><Pencil className="size-4" /></button>
        <button className="btn btn-ghost btn-sm px-2 text-danger" onClick={() => remove(b)} aria-label="Xóa"><Trash2 className="size-4" /></button>
      </div>) },
  ]
  return (
    <>
      <PageHeader title="Banner" description="Banner lớn chạy luân phiên ở đầu trang chủ, banner giữa trang hiện một ảnh." actions={<button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}><Plus className="size-4" /> Thêm banner</button>} />
      <Panel padded={false}><Table columns={columns} rows={list.data?.content} loading={list.loading} /></Panel>
      <Pagination page={page} totalPages={list.data?.totalPages} onChange={setPage} />
      {editing !== undefined && <BannerModal banner={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); list.reload() }} />}
    </>
  )
}

function BannerModal({ banner, onClose, onSaved }) {
  const [f, setF] = useState({ image: banner?.image || '', bannerType: banner?.bannerType || 'TOP', pageName: banner?.pageName || 'index', idProduct: banner?.idProduct || '', linkWeb: banner?.linkWeb || '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!f.image) return toast.error('Chọn ảnh banner')
    setSaving(true)
    try {
      await api.post(banner ? '/api/banner/admin/update' : '/api/banner/admin/create', { ...f, id: banner?.id, idProduct: f.idProduct ? Number(f.idProduct) : null })
      toast.success('Đã lưu banner')
      onSaved()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }
  return (
    <Modal open onClose={onClose} title={banner ? 'Sửa banner' : 'Thêm banner'} wide
      footer={<><button className="btn btn-ghost" onClick={onClose}>Hủy</button><button className="btn btn-dark" onClick={save} disabled={saving}>{saving && <Spinner className="size-4" />} Lưu</button></>}>
      <ImageField label="Ảnh (nên dùng tỉ lệ 5:4 cho banner lớn, 3:1 cho banner giữa trang)" value={f.image} onChange={(v) => setF({ ...f, image: v })} className="aspect-[5/2] w-full" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Vị trí">
          <select className="field" value={f.bannerType} onChange={(e) => setF({ ...f, bannerType: e.target.value })}>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </Field>
        <Field label="Trang hiển thị">
          <select className="field" value={f.pageName} onChange={(e) => setF({ ...f, pageName: e.target.value })}><option value="index">Trang chủ</option><option value="ALL">Mọi trang</option></select>
        </Field>
        <Field label="Mã sản phẩm liên kết" hint="Bấm banner sẽ mở sản phẩm này"><input className="field" type="number" value={f.idProduct} onChange={(e) => setF({ ...f, idProduct: e.target.value })} /></Field>
        <Field label="Hoặc đường dẫn" hint="Ví dụ /products?sort=sale"><input className="field" value={f.linkWeb} onChange={(e) => setF({ ...f, linkWeb: e.target.value })} /></Field>
      </div>
    </Modal>
  )
}
