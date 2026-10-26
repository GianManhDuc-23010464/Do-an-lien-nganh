import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { formatDate, formatMoney } from '../../lib/format'
import { PageHeader, Panel, Table, Toggle } from '../../components/admin/kit'
import { Badge, Field, Modal, Pagination, Spinner, useConfirm } from '../../components/ui'

function voucherState(v) {
  const today = new Date().toISOString().slice(0, 10)
  if (v.block) return ['Đã khóa', 'muted']
  if (v.endDate < today) return ['Hết hạn', 'danger']
  if (v.startDate > today) return ['Sắp diễn ra', 'warning']
  return ['Đang chạy', 'success']
}

export default function Vouchers() {
  useDocumentTitle('Mã giảm giá')
  const confirm = useConfirm()
  const [page, setPage] = useState(0)
  const list = useFetch(() => api.get('/api/voucher/admin/findAll-page', { page, size: 15, sort: 'id,desc' }), [page])
  const [editing, setEditing] = useState(undefined)

  const toggle = async (v) => { try { await api.del('/api/voucher/admin/block-or-unblock', { id: v.id }); list.reload() } catch (e) { toast.error(e.message) } }
  const remove = async (v) => {
    if (!(await confirm({ title: `Xóa mã ${v.code}?`, message: 'Đơn hàng đã dùng mã vẫn giữ số tiền đã giảm.', danger: true, confirmText: 'Xóa' }))) return
    try { await api.del('/api/voucher/admin/delete', { id: v.id }); toast.success('Đã xóa'); list.reload() } catch (e) { toast.error(e.message) }
  }

  const columns = [
    { key: 'code', title: 'Mã', render: (v) => <><p className="font-bold tracking-wide">{v.code}</p><p className="text-xs text-muted">{v.name}</p></> },
    { key: 'discount', title: 'Giảm', render: (v) => <span className="font-semibold">{formatMoney(v.discount)}</span> },
    { key: 'min', title: 'Đơn tối thiểu', render: (v) => formatMoney(v.minAmount) },
    { key: 'time', title: 'Thời gian', render: (v) => <span className="text-ink-soft">{formatDate(v.startDate)} – {formatDate(v.endDate)}</span> },
    { key: 'state', title: 'Trạng thái', render: (v) => { const [l, t] = voucherState(v); return <Badge tone={t}>{l}</Badge> } },
    { key: 'act', title: '', className: 'w-44 text-right', render: (v) => (
      <div className="flex items-center justify-end gap-1">
        <Toggle checked={!v.block} onChange={() => toggle(v)} label={<span className="sr-only">Bật / tắt</span>} />
        <button className="btn btn-ghost btn-sm px-2" onClick={() => setEditing(v)} aria-label="Sửa"><Pencil className="size-4" /></button>
        <button className="btn btn-ghost btn-sm px-2 text-danger" onClick={() => remove(v)} aria-label="Xóa"><Trash2 className="size-4" /></button>
      </div>) },
  ]

  return (
    <>
      <PageHeader title="Mã giảm giá" description="Khách nhập mã ở bước thanh toán. Mã chỉ áp dụng khi đơn đạt mức tối thiểu." actions={<button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}><Plus className="size-4" /> Tạo mã</button>} />
      <Panel padded={false}><Table columns={columns} rows={list.data?.content} loading={list.loading} empty="Chưa có mã giảm giá" /></Panel>
      <Pagination page={page} totalPages={list.data?.totalPages} onChange={setPage} />
      {editing !== undefined && <VoucherModal voucher={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); list.reload() }} />}
    </>
  )
}

function VoucherModal({ voucher, onClose, onSaved }) {
  const today = new Date().toISOString().slice(0, 10)
  const [f, setF] = useState({ code: voucher?.code || '', name: voucher?.name || '', discount: voucher?.discount ?? '', minAmount: voucher?.minAmount ?? 0, startDate: voucher?.startDate || today, endDate: voucher?.endDate || today })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const save = async () => {
    if (!f.code.trim() || !(Number(f.discount) > 0)) return toast.error('Nhập mã và số tiền giảm')
    if (f.endDate < f.startDate) return toast.error('Ngày kết thúc phải sau ngày bắt đầu')
    if (Number(f.minAmount) > 0 && Number(f.discount) > Number(f.minAmount)) return toast.error('Số tiền giảm không nên lớn hơn đơn tối thiểu')
    setSaving(true)
    try {
      await api.post(voucher ? '/api/voucher/admin/update' : '/api/voucher/admin/create', { ...f, id: voucher?.id, code: f.code.trim().toUpperCase(), discount: Number(f.discount), minAmount: Number(f.minAmount) || 0, block: voucher?.block ?? false })
      toast.success('Đã lưu mã giảm giá')
      onSaved()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }
  return (
    <Modal open onClose={onClose} title={voucher ? `Sửa mã ${voucher.code}` : 'Tạo mã giảm giá'}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Hủy</button><button className="btn btn-dark" onClick={save} disabled={saving}>{saving && <Spinner className="size-4" />} Lưu</button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mã"><input className="field uppercase" value={f.code} onChange={set('code')} placeholder="SALE50K" /></Field>
        <Field label="Tên chương trình"><input className="field" value={f.name} onChange={set('name')} /></Field>
        <Field label="Số tiền giảm (đ)"><input className="field" type="number" min="0" step="1000" value={f.discount} onChange={set('discount')} /></Field>
        <Field label="Đơn tối thiểu (đ)"><input className="field" type="number" min="0" step="1000" value={f.minAmount} onChange={set('minAmount')} /></Field>
        <Field label="Bắt đầu"><input className="field" type="date" value={f.startDate} onChange={set('startDate')} /></Field>
        <Field label="Kết thúc"><input className="field" type="date" value={f.endDate} onChange={set('endDate')} /></Field>
      </div>
    </Modal>
  )
}
