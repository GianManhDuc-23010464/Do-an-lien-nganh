import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { formatDate } from '../../lib/format'
import { ImageField, PageHeader, Panel, Table, Toggle } from '../../components/admin/kit'
import RichEditor from '../../components/admin/RichEditor'
import { Badge, Field, Modal, Pagination, Spinner, useConfirm } from '../../components/ui'

export default function Blogs() {
  useDocumentTitle('Bài viết')
  const confirm = useConfirm()
  const [page, setPage] = useState(0)
  const list = useFetch(() => api.get('/api/blog/public/findAll', { page, size: 15, sort: 'id,desc' }), [page])
  const [editing, setEditing] = useState(undefined)
  const remove = async (b) => {
    if (!(await confirm({ title: `Xóa bài “${b.title}”?`, message: 'Bài viết sẽ bị xóa vĩnh viễn.', danger: true, confirmText: 'Xóa' }))) return
    try { await api.del('/api/blog/admin/delete', { id: b.id }); list.reload() } catch (e) { toast.error(e.message) }
  }
  const columns = [
    { key: 't', title: 'Bài viết', render: (b) => <div className="flex items-center gap-3"><img src={b.imageBanner || '/placeholder.svg'} alt="" className="h-12 w-20 rounded-sm object-cover" /><div className="min-w-0"><p className="line-clamp-1 font-medium">{b.title}</p><p className="line-clamp-1 text-xs text-muted">{b.description}</p></div></div> },
    { key: 'd', title: 'Ngày đăng', render: (b) => formatDate(b.createdDate) },
    { key: 'p', title: '', render: (b) => b.primaryBlog && <Badge tone="violet">Bài nổi bật</Badge> },
    { key: 'act', title: '', className: 'w-24 text-right', render: (b) => (
      <div className="flex justify-end gap-1">
        <button className="btn btn-ghost btn-sm px-2" onClick={() => setEditing(b)} aria-label="Sửa"><Pencil className="size-4" /></button>
        <button className="btn btn-ghost btn-sm px-2 text-danger" onClick={() => remove(b)} aria-label="Xóa"><Trash2 className="size-4" /></button>
      </div>) },
  ]
  return (
    <>
      <PageHeader title="Bài viết" actions={<button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}><Plus className="size-4" /> Viết bài</button>} />
      <Panel padded={false}><Table columns={columns} rows={list.data?.content} loading={list.loading} empty="Chưa có bài viết" /></Panel>
      <Pagination page={page} totalPages={list.data?.totalPages} onChange={setPage} />
      {editing !== undefined && <BlogModal blog={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); list.reload() }} />}
    </>
  )
}

function BlogModal({ blog, onClose, onSaved }) {
  const [f, setF] = useState({ title: blog?.title || '', description: blog?.description || '', imageBanner: blog?.imageBanner || '', primaryBlog: !!blog?.primaryBlog, content: blog?.content || '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!f.title.trim() || !f.content.trim()) return toast.error('Nhập tiêu đề và nội dung')
    setSaving(true)
    try {
      await api.post(blog ? '/api/blog/admin/update' : '/api/blog/admin/create', { ...f, id: blog?.id })
      toast.success(blog ? 'Đã lưu bài viết' : 'Đã đăng bài viết')
      onSaved()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }
  return (
    <Modal open onClose={onClose} title={blog ? 'Sửa bài viết' : 'Viết bài mới'} wide
      footer={<><button className="btn btn-ghost" onClick={onClose}>Hủy</button><button className="btn btn-dark" onClick={save} disabled={saving}>{saving && <Spinner className="size-4" />} {blog ? 'Lưu' : 'Đăng bài'}</button></>}>
      <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
        <ImageField label="Ảnh bìa" value={f.imageBanner} onChange={(v) => setF({ ...f, imageBanner: v })} className="aspect-[4/3] w-full" />
        <div className="space-y-4">
          <Field label="Tiêu đề"><input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Mô tả ngắn"><textarea className="field" rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Toggle checked={f.primaryBlog} onChange={(v) => setF({ ...f, primaryBlog: v })} label="Bài nổi bật" />
        </div>
      </div>
      <div className="mt-5"><span className="label">Nội dung</span><RichEditor value={f.content} onChange={(v) => setF((s) => ({ ...s, content: v }))} /></div>
    </Modal>
  )
}
