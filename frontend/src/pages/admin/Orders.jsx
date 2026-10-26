import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { PAY_TYPES, STATUS_ACTION, STATUS_META, formatDateTime, formatMoney } from '../../lib/format'
import OrderTimeline from '../../components/shop/OrderTimeline'
import { PageHeader, Panel, Table } from '../../components/admin/kit'
import { Badge, Modal, PageLoader, Pagination, Spinner, StatusBadge, cx, useConfirm } from '../../components/ui'

const TABS = [['', 'Tất cả'], ['1', 'Chờ xác nhận'], ['2', 'Đã xác nhận'], ['3', 'Đang giao'], ['4', 'Đã nhận'], ['7', 'Chờ thanh toán'], ['5', 'Đã hủy'], ['6', 'Không nhận']]

export default function Orders() {
  useDocumentTitle('Đơn hàng')
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || ''
  const paytype = params.get('paytype') || ''
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const page = Number(params.get('page') || 0)
  const [openId, setOpenId] = useState(null)

  const list = useFetch(() => api.get('/api/invoice/admin/find-all', {
    status, paytype, from: from && to ? from : '', to: from && to ? to : '', page, size: 15, sort: 'id,desc',
  }), [params.toString()])

  const set = (k, v) => {
    const next = new URLSearchParams(params)
    v ? next.set(k, v) : next.delete(k)
    if (k !== 'page') next.delete('page')
    setParams(next)
  }

  const columns = [
    { key: 'id', title: 'Mã', render: (o) => <span className="font-semibold">#{o.id}</span> },
    { key: 'customer', title: 'Khách hàng', render: (o) => <><p className="font-medium">{o.receiverName}</p><p className="text-xs text-muted">{o.phone}</p></> },
    { key: 'date', title: 'Thời gian', render: (o) => <span className="text-ink-soft">{formatDateTime(o.createdDate, o.createdTime)}</span> },
    { key: 'pay', title: 'Thanh toán', render: (o) => <><p>{PAY_TYPES[o.payType]}</p>{o.paid ? <span className="text-xs font-semibold text-success">Đã thu tiền</span> : <span className="text-xs text-muted">Chưa thu</span>}</> },
    { key: 'total', title: 'Tổng tiền', className: 'text-right', render: (o) => <span className="font-semibold">{formatMoney(o.payableAmount)}</span> },
    { key: 'status', title: 'Trạng thái', render: (o) => <StatusBadge status={o.status} /> },
  ]

  return (
    <>
      <PageHeader title="Đơn hàng" description="Bấm vào một đơn để xem chi tiết và chuyển trạng thái." />
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([v, label]) => <button key={v} className={cx('chip h-8 px-3.5', status === v && 'chip-active')} onClick={() => set('status', v)}>{label}</button>)}
      </div>
      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <select className="field h-9 w-auto text-sm" value={paytype} onChange={(e) => set('paytype', e.target.value)} aria-label="Hình thức thanh toán">
            <option value="">Mọi hình thức</option>
            {Object.entries(PAY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-muted">Từ <input type="date" className="field h-9 w-auto text-sm" value={from} onChange={(e) => set('from', e.target.value)} /></label>
          <label className="flex items-center gap-2 text-sm text-muted">đến <input type="date" className="field h-9 w-auto text-sm" value={to} onChange={(e) => set('to', e.target.value)} /></label>
          {list.data && <span className="ml-auto text-sm text-muted">{list.data.totalElements} đơn</span>}
        </div>
        <Table columns={columns} rows={list.data?.content} loading={list.loading} onRowClick={(o) => setOpenId(o.id)} empty="Không có đơn nào khớp bộ lọc" />
      </Panel>
      <Pagination page={page} totalPages={list.data?.totalPages} onChange={(p) => set('page', String(p))} />
      {openId && <OrderDrawer id={openId} onClose={() => setOpenId(null)} onChanged={list.reload} />}
    </>
  )
}

function OrderDrawer({ id, onClose, onChanged }) {
  const confirm = useConfirm()
  const order = useFetch(() => api.get('/api/invoice/admin/find-by-id', { idInvoice: id }), [id])
  const items = useFetch(() => api.get('/api/invoice-detail/admin/find-by-invoice', { idInvoice: id }), [id])
  const [busy, setBusy] = useState(null)
  const o = order.data

  const move = async (statusId) => {
    const danger = statusId === 5 || statusId === 6
    if (danger && !(await confirm({ title: `${STATUS_ACTION[statusId]}?`, message: 'Hàng trong đơn sẽ được cộng lại vào kho. Khách sẽ nhận email thông báo.', danger: true, confirmText: STATUS_ACTION[statusId] }))) return
    setBusy(statusId)
    try {
      const res = await api.post('/api/invoice/admin/update-status', undefined, { idInvoice: id, idStatus: statusId })
      order.setData(res)
      toast.success(`Đơn #${id}: ${STATUS_META[statusId].label}`)
      onChanged()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal open onClose={onClose} title={`Đơn #${id}`} wide
      footer={o?.nextStatuses?.length ? o.nextStatuses.map((s) => (
        <button key={s} className={cx('btn', s === 5 || s === 6 ? 'btn-outline' : 'btn-dark')} disabled={!!busy} onClick={() => move(s)}>
          {busy === s && <Spinner className="size-4" />} {STATUS_ACTION[s]}
        </button>
      )) : null}>
      {order.loading || !o ? <PageLoader /> : (
        <div className="grid gap-8 md:grid-cols-[1fr_220px]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={o.status} />
              {o.paid ? <Badge tone="success">Đã thu tiền</Badge> : <Badge>Chưa thu tiền</Badge>}
              <span className="text-sm text-muted">{PAY_TYPES[o.payType]}</span>
            </div>
            <div className="text-sm">
              <p className="font-semibold">{o.receiverName}, {o.phone}</p>
              <p className="text-ink-soft">{o.address}</p>
              {o.note && <p className="mt-2 rounded-sm bg-warning-soft p-3">Ghi chú: {o.note}</p>}
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {(items.data || []).map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3 text-sm">
                  <img src={d.linkImage || '/placeholder.svg'} alt="" className="size-12 rounded-sm object-cover" />
                  <div className="min-w-0 flex-1"><p className="line-clamp-1 font-medium">{d.productName}</p><p className="text-muted">{d.colorName}, size {d.productSize?.sizeName} × {d.quantity}</p></div>
                  <span className="font-semibold">{formatMoney(d.price * d.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Tiền hàng</dt><dd>{formatMoney((o.totalAmount || 0) + (o.discount || 0))}</dd></div>
              {o.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Giảm giá</dt><dd>−{formatMoney(o.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Phí ship</dt><dd>{formatMoney(o.shippingFee || 0)}</dd></div>
              <div className="flex justify-between border-t border-line pt-1.5 font-bold"><dt>Tổng</dt><dd>{formatMoney(o.payableAmount)}</dd></div>
            </dl>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold">Lịch sử</h3>
            <OrderTimeline order={o} />
          </div>
        </div>
      )}
    </Modal>
  )
}
