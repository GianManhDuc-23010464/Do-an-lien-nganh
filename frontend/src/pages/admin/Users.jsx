import { useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useDebounced, useFetch, useDocumentTitle } from '../../lib/hooks'
import { formatDate } from '../../lib/format'
import { PageHeader, Panel, SearchBox, Table } from '../../components/admin/kit'
import { Badge, Field, Modal, Pagination, Spinner, cx, useConfirm } from '../../components/ui'

export default function Users() {
  useDocumentTitle('Người dùng')
  const { user: me } = useAuth()
  const confirm = useConfirm()
  const [role, setRole] = useState('ROLE_USER')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [adding, setAdding] = useState(false)
  const dq = useDebounced(q)
  const list = useFetch(() => api.get('/api/admin/get-user-by-role', { role, q: dq, page, size: 15, sort: 'id,desc' }), [role, dq, page])

  const toggleLock = async (u) => {
    const locking = u.actived
    if (locking && !(await confirm({ title: `Khóa tài khoản ${u.email}?`, message: 'Người này sẽ bị đăng xuất và không đăng nhập được nữa cho tới khi được mở khóa.', danger: true, confirmText: 'Khóa' }))) return
    try { await api.post('/api/admin/lockOrUnlockUser', undefined, { id: u.id }); toast.success(locking ? 'Đã khóa tài khoản' : 'Đã mở khóa'); list.reload() } catch (e) { toast.error(e.message) }
  }

  const columns = [
    { key: 'n', title: 'Họ tên', render: (u) => <><p className="font-medium">{u.fullname || '—'}</p><p className="text-xs text-muted">{u.email}</p></> },
    { key: 'p', title: 'Điện thoại', render: (u) => u.phone || <span className="text-muted">—</span> },
    { key: 'd', title: 'Ngày tạo', render: (u) => formatDate(u.createdDate) },
    { key: 's', title: 'Trạng thái', render: (u) => u.actived ? <Badge tone="success">Hoạt động</Badge> : <Badge tone="danger">Đã khóa / chưa kích hoạt</Badge> },
    { key: 'a', title: '', className: 'w-28 text-right', render: (u) => u.id !== me?.id && (
      <button className={cx('btn btn-sm', u.actived ? 'btn-ghost text-danger' : 'btn-outline')} onClick={() => toggleLock(u)}>{u.actived ? 'Khóa' : 'Mở khóa'}</button>) },
  ]

  return (
    <>
      <PageHeader title="Người dùng" actions={<button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus className="size-4" /> Thêm quản trị viên</button>} />
      <div className="mb-4 flex gap-2">
        {[['ROLE_USER', 'Khách hàng'], ['ROLE_ADMIN', 'Quản trị viên']].map(([r, l]) => (
          <button key={r} className={cx('chip h-8 px-3.5', role === r && 'chip-active')} onClick={() => { setRole(r); setPage(0) }}>{l}</button>
        ))}
      </div>
      <Panel padded={false}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(0) }} placeholder="Tìm theo tên, email, SĐT" />
          {list.data && <span className="text-sm text-muted">{list.data.totalElements} tài khoản</span>}
        </div>
        <Table columns={columns} rows={list.data?.content} loading={list.loading} />
      </Panel>
      <Pagination page={page} totalPages={list.data?.totalPages} onChange={setPage} />
      {adding && <AddAdmin onClose={() => setAdding(false)} onSaved={() => { setAdding(false); setRole('ROLE_ADMIN'); list.reload() }} />}
    </>
  )
}

function AddAdmin({ onClose, onSaved }) {
  const [f, setF] = useState({ fullname: '', email: '', phone: '', password: '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!f.fullname || !/^\S+@\S+\.\S+$/.test(f.email) || f.password.length < 6) return toast.error('Nhập họ tên, email hợp lệ và mật khẩu từ 6 ký tự')
    setSaving(true)
    try { await api.post('/api/admin/addaccount', f); toast.success('Đã tạo tài khoản quản trị'); onSaved() } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }
  return (
    <Modal open onClose={onClose} title="Thêm quản trị viên"
      footer={<><button className="btn btn-ghost" onClick={onClose}>Hủy</button><button className="btn btn-dark" onClick={save} disabled={saving}>{saving && <Spinner className="size-4" />} Tạo tài khoản</button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Họ tên"><input className="field" value={f.fullname} onChange={(e) => setF({ ...f, fullname: e.target.value })} /></Field>
        <Field label="Số điện thoại"><input className="field" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Email đăng nhập"><input className="field" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Mật khẩu"><input className="field" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
      </div>
    </Modal>
  )
}
