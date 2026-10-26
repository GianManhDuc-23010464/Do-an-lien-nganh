import { useState } from 'react'
import { Link, NavLink, Outlet, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { MapPin, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { PAY_TYPES, STATUS, STATUS_META, formatDateTime, formatMoney, fullAddress } from '../../lib/format'
import { BUTTON_LABEL, PRIMARY, orderButtons, useOrderActions } from '../../components/shop/useOrderActions'
import AddressForm from '../../components/shop/AddressForm'
import { Badge, Empty, ErrorState, Field, Modal, PageLoader, Spinner, StatusBadge, cx, useConfirm } from '../../components/ui'

export function AccountLayout() {
  const { user } = useAuth()
  const tabs = [['/account/orders', 'Đơn mua'], ['/account/addresses', 'Địa chỉ'], ['/account', 'Hồ sơ']]
  return (
    <div className="container-x pt-6">
      <h1 className="text-xl font-semibold">{user?.fullname || 'Tài khoản'}</h1>
      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-line" aria-label="Tài khoản">
        {tabs.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/account'} className={({ isActive }) => cx('-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold', isActive ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink')}>{label}</NavLink>
        ))}
      </nav>
      <div className="mt-6"><Outlet /></div>
    </div>
  )
}

// Các tab đơn mua giống app mua sắm
const ORDER_TABS = [
  ['all', 'Tất cả', null],
  ['pay', 'Chờ thanh toán', [STATUS.AWAITING_PAYMENT]],
  ['confirm', 'Chờ xác nhận', [STATUS.PENDING]],
  ['pickup', 'Chờ lấy hàng', [STATUS.CONFIRMED]],
  ['shipping', 'Chờ giao hàng', [STATUS.SHIPPING]],
  ['done', 'Đã giao', [STATUS.RECEIVED]],
  ['cancel', 'Đã hủy', [STATUS.CANCELLED, STATUS.REFUSED]],
]

export function Orders() {
  useDocumentTitle('Đơn mua')
  const { data, loading, error, reload } = useFetch(() => api.get('/api/invoice/user/find-by-user'), [])
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'all'
  if (loading) return <PageLoader />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const statuses = ORDER_TABS.find((t) => t[0] === tab)?.[2]
  const list = (data || []).filter((o) => !statuses || statuses.includes(o.status?.id))
  const countOf = (sts) => (data || []).filter((o) => sts.includes(o.status?.id)).length
  return (
    <>
      <div className="-mx-4 flex overflow-x-auto border-b border-line bg-paper sm:mx-0" role="tablist">
        {ORDER_TABS.map(([id, label, sts]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setParams(id === 'all' ? {} : { tab: id })}
            className={cx('-mb-px shrink-0 border-b-2 px-4 py-3 text-[13px]', tab === id ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-brand')}>
            {label}{sts && countOf(sts) > 0 && ['pay', 'confirm', 'pickup', 'shipping'].includes(id) ? ` (${countOf(sts)})` : ''}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty icon={Package} title="Chưa có đơn hàng" action={<Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>} />
      ) : (
        <ul className="mt-3 space-y-3">{list.map((o) => <OrderCard key={o.id} order={o} onChanged={reload} />)}</ul>
      )}
    </>
  )
}

function OrderCard({ order: o, onChanged }) {
  const items = useFetch(() => api.get('/api/invoice-detail/user/find-by-invoice', { idInvoice: o.id }), [o.id])
  const actions = useOrderActions(onChanged)
  const buttons = orderButtons(o)
  const run = { cancel: () => actions.cancel(o), pay: () => actions.pay(o), received: () => actions.received(o), again: () => actions.buyAgain(items.data || []), review: () => actions.review(items.data) }
  return (
    <li className="border border-line bg-paper">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 text-[13px]">
        <span className="font-semibold">Đơn #{o.id} <span className="ml-2 font-normal text-muted">{formatDateTime(o.createdDate, o.createdTime)}</span></span>
        <span className="text-brand">{STATUS_META[o.status?.id]?.label || o.status?.name}</span>
      </div>
      <Link to={`/account/orders/${o.id}`} className="block divide-y divide-line hover:bg-mist/50">
        {(items.data || []).slice(0, 2).map((d) => (
          <div key={d.id} className="flex gap-3 px-4 py-3 text-[13px]">
            <img src={d.linkImage || '/placeholder.svg'} alt="" className="size-16 shrink-0 bg-mist object-cover" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1">{d.productName}</p>
              <p className="text-xs text-muted">Phân loại: {d.colorName}, {d.productSize?.sizeName}</p>
              <p className="text-xs">x{d.quantity}</p>
            </div>
            <span>{formatMoney(d.price)}</span>
          </div>
        ))}
        {items.data?.length > 2 && <p className="px-4 py-2 text-center text-xs text-muted">Xem thêm {items.data.length - 2} sản phẩm</p>}
        {items.loading && <div className="h-20 animate-pulse bg-mist/60" />}
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-4 py-3">
        <p className="mr-auto text-xs text-muted sm:mr-0">{PAY_TYPES[o.payType]}</p>
        <p className="text-[13px]">Thành tiền: <span className="text-base font-semibold text-brand">{formatMoney(o.payableAmount)}</span></p>
      </div>
      {buttons.length > 0 && (
        <div className="flex justify-end gap-2 px-4 pb-4">
          {buttons.map((b) => (
            <button key={b} className={cx('btn btn-sm min-w-28', PRIMARY.has(b) ? 'btn-primary' : 'btn-outline')} disabled={!!actions.busy} onClick={run[b]}>
              {actions.busy && ((b === 'again' && actions.busy === 'again') || actions.busy === b) && <Spinner className="size-3.5" />} {BUTTON_LABEL[b]}
            </button>
          ))}
        </div>
      )}
    </li>
  )
}

export function Addresses() {
  useDocumentTitle('Sổ địa chỉ')
  const { data, loading, reload } = useFetch(() => api.get('/api/user-address/user/my-address'), [])
  const [editing, setEditing] = useState(undefined)
  const confirm = useConfirm()
  const remove = async (a) => {
    if (!(await confirm({ title: 'Xóa địa chỉ?', message: `${a.fullname}, ${fullAddress(a)}`, danger: true, confirmText: 'Xóa' }))) return
    try { await api.del('/api/user-address/user/delete', { id: a.id }); toast.success('Đã xóa địa chỉ'); reload() } catch (e) { toast.error(e.message) }
  }
  if (loading) return <PageLoader />
  return (
    <>
      <div className="mb-5 flex justify-end"><button className="btn btn-dark btn-sm" onClick={() => setEditing(null)}><Plus className="size-4" /> Thêm địa chỉ</button></div>
      {!data?.length ? <Empty icon={MapPin} title="Chưa có địa chỉ">Thêm địa chỉ để đặt hàng nhanh hơn.</Empty> : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((a) => (
            <div key={a.id} className="rounded-sm border border-line p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{a.fullname} <span className="font-normal text-muted">{a.phone}</span></p>
                <div className="-mr-2 -mt-1 flex">
                  <button className="btn btn-ghost btn-sm px-2" onClick={() => setEditing(a)} aria-label="Sửa"><Pencil className="size-4" /></button>
                  <button className="btn btn-ghost btn-sm px-2 text-danger" onClick={() => remove(a)} aria-label="Xóa"><Trash2 className="size-4" /></button>
                </div>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{fullAddress(a)}</p>
              {a.primaryAddres && <Badge tone="violet" className="mt-2">Mặc định</Badge>}
            </div>
          ))}
        </div>
      )}
      <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ'} wide>
        {editing !== undefined && <AddressForm initial={editing} onCancel={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); reload() }} />}
      </Modal>
    </>
  )
}

export function Profile() {
  useDocumentTitle('Tài khoản')
  const { user } = useAuth()
  const [form, setForm] = useState({ oldPass: '', newPass: '', again: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState({})
  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (form.newPass.length < 6) er.newPass = 'Mật khẩu mới tối thiểu 6 ký tự'
    if (form.newPass !== form.again) er.again = 'Mật khẩu nhập lại không khớp'
    setErr(er)
    if (Object.keys(er).length) return
    setSaving(true)
    try {
      await api.post('/api/user/change-password', { oldPass: form.oldPass, newPass: form.newPass })
      toast.success('Đã đổi mật khẩu')
      setForm({ oldPass: '', newPass: '', again: '' })
    } catch (e2) {
      toast.error(e2.status === 500 || e2.message === 'Invalid password' ? 'Mật khẩu hiện tại không đúng' : e2.message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <section>
        <h2 className="text-xl font-bold">Thông tin</h2>
        <dl className="mt-4 space-y-3 text-[15px]">
          <div><dt className="text-sm text-muted">Họ tên</dt><dd className="font-medium">{user?.fullname}</dd></div>
          <div><dt className="text-sm text-muted">Email</dt><dd className="font-medium">{user?.email}</dd></div>
          <div><dt className="text-sm text-muted">Số điện thoại</dt><dd className="font-medium">{user?.phone || '—'}</dd></div>
        </dl>
      </section>
      <section>
        <h2 className="text-xl font-bold">Đổi mật khẩu</h2>
        <form onSubmit={submit} className="mt-4 max-w-sm space-y-4" noValidate>
          <Field label="Mật khẩu hiện tại"><input type="password" className="field" value={form.oldPass} onChange={(e) => setForm({ ...form, oldPass: e.target.value })} autoComplete="current-password" required /></Field>
          <Field label="Mật khẩu mới" error={err.newPass}><input type="password" className="field" value={form.newPass} onChange={(e) => setForm({ ...form, newPass: e.target.value })} autoComplete="new-password" /></Field>
          <Field label="Nhập lại mật khẩu mới" error={err.again}><input type="password" className="field" value={form.again} onChange={(e) => setForm({ ...form, again: e.target.value })} autoComplete="new-password" /></Field>
          <button className="btn btn-dark" disabled={saving}>{saving && <Spinner className="size-4" />} Đổi mật khẩu</button>
        </form>
      </section>
    </div>
  )
}
