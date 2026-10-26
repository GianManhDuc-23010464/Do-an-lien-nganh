import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { Field, Spinner } from '../ui'

let provinceCache = null
async function loadProvinces() {
  if (!provinceCache) provinceCache = api.get('/api/address/public/province').catch((e) => { provinceCache = null; throw e })
  return provinceCache
}

/** Form thêm / sửa địa chỉ. initial: UserAdressResponse | null */
export default function AddressForm({ initial, onSaved, onCancel }) {
  const [provinces, setProvinces] = useState([])
  const [form, setForm] = useState({
    fullname: initial?.fullname || '',
    phone: initial?.phone || '',
    streetName: initial?.streetName || '',
    primaryAddres: initial?.primaryAddres ?? false,
    provinceId: initial?.wards?.districts?.province?.id || '',
    districtId: initial?.wards?.districts?.id || '',
    wardId: initial?.wards?.id || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadProvinces().then(setProvinces).catch((e) => toast.error(e.message)) }, [])

  const districts = useMemo(() => provinces.find((p) => p.id === Number(form.provinceId))?.districts || [], [provinces, form.provinceId])
  const wards = useMemo(() => districts.find((d) => d.id === Number(form.districtId))?.wards || [], [districts, form.districtId])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const err = {}
    if (!form.fullname.trim()) err.fullname = 'Nhập tên người nhận'
    if (!/^0\d{9}$/.test(form.phone.trim())) err.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0'
    if (!form.wardId) err.wardId = 'Chọn đủ tỉnh, quận/huyện, phường/xã'
    if (!form.streetName.trim()) err.streetName = 'Nhập số nhà, tên đường'
    setErrors(err)
    if (Object.keys(err).length) return
    setSaving(true)
    try {
      const body = { fullname: form.fullname.trim(), phone: form.phone.trim(), streetName: form.streetName.trim(), primaryAddres: form.primaryAddres, wards: { id: Number(form.wardId) } }
      const saved = initial?.id
        ? await api.post('/api/user-address/user/update', { ...body, id: initial.id })
        : await api.post('/api/user-address/user/create', body)
      toast.success('Đã lưu địa chỉ')
      onSaved?.(saved)
    } catch (e2) {
      toast.error(e2.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Họ tên người nhận" error={errors.fullname}><input className="field" value={form.fullname} onChange={set('fullname')} autoComplete="name" /></Field>
      <Field label="Số điện thoại" error={errors.phone}><input className="field" value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" /></Field>
      <Field label="Tỉnh / Thành phố">
        <select className="field" value={form.provinceId} onChange={(e) => setForm((f) => ({ ...f, provinceId: e.target.value, districtId: '', wardId: '' }))}>
          <option value="">{provinces.length ? 'Chọn tỉnh / thành' : 'Đang tải…'}</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field label="Quận / Huyện">
        <select className="field" value={form.districtId} disabled={!districts.length} onChange={(e) => setForm((f) => ({ ...f, districtId: e.target.value, wardId: '' }))}>
          <option value="">Chọn quận / huyện</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <Field label="Phường / Xã" error={errors.wardId}>
        <select className="field" value={form.wardId} disabled={!wards.length} onChange={set('wardId')}>
          <option value="">Chọn phường / xã</option>
          {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </Field>
      <Field label="Số nhà, tên đường" error={errors.streetName}><input className="field" value={form.streetName} onChange={set('streetName')} autoComplete="street-address" /></Field>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" className="size-4 accent-ink" checked={form.primaryAddres} onChange={set('primaryAddres')} /> Đặt làm địa chỉ mặc định
      </label>
      <div className="flex justify-end gap-2 sm:col-span-2">
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Hủy</button>}
        <button className="btn btn-dark" disabled={saving}>{saving && <Spinner className="size-4" />} Lưu địa chỉ</button>
      </div>
    </form>
  )
}
