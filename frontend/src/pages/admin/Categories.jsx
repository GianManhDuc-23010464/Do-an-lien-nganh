import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useDebounced, useFetch, useDocumentTitle } from '../../lib/hooks'
import { ImageField, PageHeader, Panel, SearchBox, Table, Toggle } from '../../components/admin/kit'
import { Badge, Field, Modal, Pagination, Spinner, useConfirm } from '../../components/ui'

export default function Categories() {
  useDocumentTitle('Danh mục')
  const confirm = useConfirm()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const dq = useDebounced(q)
  const list = useFetch(() => api.get('/api/category/public/search', { q: dq, page, size: 20, sort: 'id,desc' }), [dq, page])
  const all = useFetch(() => api.get('/api/category/public/findAllList'), [])
  const [editing, setEditing] = useState(undefined)

  const remove = async (c) => {
    if (!(await confirm({ title: `Xóa danh mục “${c.name}”?`, message: 'Sản phẩm thuộc danh mục này sẽ không còn được lọc theo danh mục.', danger: true, confirmText: 'Xóa' }))) return
    try { await api.del('/api/category/admin/delete', { id: c.id }); toast.success('Đã xóa'); list.reload(); all.reload() } catch (e) { toast.error(e.message) }
  }

  const columns = [
    { key: 'name', title: 'Tên', render: (c) => <div className="flex items-center gap-3"><img src={c.imageBanner || '/placeholder.svg'} alt="" className="size-10 rounded-sm object-cover" /><span className="font-medium">{c.name}</span></div> },
    { key: 'parent', title: 'Thuộc nhóm', render: (c) => c.categoryParentName || <span className="text-muted">Nhóm chính</span> },
    { key: 'menu', title: 'Hiện trên menu', render: (c) => c.isPrimary ? <Badge tone="success">Có</Badge> : <span className="text-muted">Không</span> },
    { key: 'act', title: '', className: 'w-24 text-right', render: (c) => (
      <div className="flex justify-end gap-1">
        <button className="btn btn-ghost btn-sm px-2" onClick={() => setEditing(c)} aria-label="Sửa"><Pencil className="size-4" /></button>
        <button className="btn btn-ghost btn-sm px-2 text-danger" onClick={() => remove(c)} aria-label="Xóa"><Trash2 className="size-4" /></button>
      </div>) },
  ]

  return (
    <>
      <PageHeader title="Danh mục" actions={<button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}><Plus className="size-4" /> Thêm danh mục</button>} />
      <Panel padded={false}>
        <div className="border-b border-line px-4 py-3"><SearchBox value={q} onChange={(v) => { setQ(v); setPage(0) }} placeholder="Tìm danh mục" /></div>
        <Table columns={columns} rows={list.data?.content} loading={list.loading} />
      </Panel>
      <Pagination page={page} totalPages={list.data?.totalPages} onChange={setPage} />
      {editing !== undefined && <CategoryModal category={editing} parents={(all.data || []).filter((c) => !c.categoryParentId && c.id !== editing?.id)} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); list.reload(); all.reload() }} />}
    </>
  )
}

function CategoryModal({ category, parents, onClose, onSaved }) {
  const [form, setForm] = useState({ name: category?.name || '', imageBanner: category?.imageBanner || '', isPrimary: !!category?.isPrimary, parentId: category?.categoryParentId || '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!form.name.trim()) return toast.error('Nhập tên danh mục')
    setSaving(true)
    try {
      const body = { id: category?.id, name: form.name.trim(), imageBanner: form.imageBanner, isPrimary: form.isPrimary, category: form.parentId ? { id: Number(form.parentId) } : null }
      await api.post(category ? '/api/category/admin/update' : '/api/category/admin/create', body)
      toast.success('Đã lưu danh mục')
      onSaved()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }
  return (
    <Modal open onClose={onClose} title={category ? 'Sửa danh mục' : 'Thêm danh mục'}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Hủy</button><button className="btn btn-dark" onClick={save} disabled={saving}>{saving && <Spinner className="size-4" />} Lưu</button></>}>
      <div className="flex gap-5">
        <ImageField label="Ảnh" value={form.imageBanner} onChange={(v) => setForm({ ...form, imageBanner: v })} className="aspect-[4/5] w-28" />
        <div className="flex-1 space-y-4">
          <Field label="Tên danh mục"><input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Thuộc nhóm">
            <select className="field" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
              <option value="">Không (đây là nhóm chính)</option>
              {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Toggle checked={form.isPrimary} onChange={(v) => setForm({ ...form, isPrimary: v })} label="Hiện trên menu và trang chủ" />
        </div>
      </div>
    </Modal>
  )
}
