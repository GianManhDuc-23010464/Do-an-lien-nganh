import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { discountPercent } from '../../lib/format'
import { ImageField, MultiImageButton, PageHeader, Panel } from '../../components/admin/kit'
import RichEditor from '../../components/admin/RichEditor'
import { ErrorState, Field, PageLoader, Spinner, cx } from '../../components/ui'

const PRESET_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
let tmpId = 0
const newSize = (sizeName = '') => ({ key: `n${++tmpId}`, sizeName, quantity: 0 })
const newColor = () => ({ key: `n${++tmpId}`, colorName: '', linkImage: '', sizes: PRESET_SIZES.slice(0, 4).map(newSize) })

export default function ProductForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const existing = useFetch(() => (isNew ? Promise.resolve(null) : api.get('/api/product/admin/findById', { id })), [id])
  const categories = useFetch(() => api.get('/api/category/public/findAllList'), [])
  useDocumentTitle(isNew ? 'Thêm sản phẩm' : 'Sửa sản phẩm')
  if (existing.loading || categories.loading) return <PageLoader />
  if (existing.error) return <ErrorState error={existing.error} onRetry={existing.reload} />
  return <Form key={id || 'new'} product={existing.data} categories={categories.data || []} />
}

function Form({ product, categories }) {
  const navigate = useNavigate()
  const isNew = !product
  const [form, setForm] = useState(() => ({
    name: product?.name || '',
    code: product?.code || '',
    price: product?.price ?? '',
    oldPrice: product?.oldPrice ?? '',
    imageBanner: product?.imageBanner || '',
    description: product?.description || '',
    categoryIds: (product?.productCategories || []).map((pc) => pc.category?.id).filter(Boolean),
  }))
  const [images, setImages] = useState(() => (product?.productImages || []).map((i) => ({ id: i.id, link: i.linkImage })))
  const [colors, setColors] = useState(() => product?.productColors?.length
    ? product.productColors.map((c) => ({ id: c.id, key: `c${c.id}`, colorName: c.colorName, linkImage: c.linkImage, sizes: (c.productSizes || []).map((s) => ({ id: s.id, key: `s${s.id}`, sizeName: s.sizeName, quantity: s.quantity })) }))
    : [newColor()])
  const [removed, setRemoved] = useState({ images: [], colors: [], sizes: [] })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const tree = useMemo(() => categories.filter((c) => !c.categoryParentId).map((p) => ({ ...p, children: categories.filter((c) => c.categoryParentId === p.id) })), [categories])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }))
  const toggleCat = (cid) => setForm((f) => ({ ...f, categoryIds: f.categoryIds.includes(cid) ? f.categoryIds.filter((x) => x !== cid) : [...f.categoryIds, cid] }))
  const updateColor = (key, patch) => setColors((cs) => cs.map((c) => (c.key === key ? { ...c, ...patch } : c)))
  const removeColor = (c) => {
    setColors((cs) => cs.filter((x) => x.key !== c.key))
    if (c.id) setRemoved((r) => ({ ...r, colors: [...r.colors, c.id] }))
  }
  const updateSize = (ckey, skey, patch) => setColors((cs) => cs.map((c) => (c.key === ckey ? { ...c, sizes: c.sizes.map((s) => (s.key === skey ? { ...s, ...patch } : s)) } : c)))
  const removeSize = (ckey, s) => {
    setColors((cs) => cs.map((c) => (c.key === ckey ? { ...c, sizes: c.sizes.filter((x) => x.key !== s.key) } : c)))
    if (s.id) setRemoved((r) => ({ ...r, sizes: [...r.sizes, s.id] }))
  }

  useEffect(() => { if (!form.imageBanner && images[0]) setForm((f) => ({ ...f, imageBanner: images[0].link })) }, [images, form.imageBanner])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nhập tên sản phẩm'
    if (!form.code.trim()) e.code = 'Nhập mã sản phẩm'
    if (!(Number(form.price) > 0)) e.price = 'Giá bán phải lớn hơn 0'
    if (form.oldPrice !== '' && Number(form.oldPrice) > 0 && Number(form.oldPrice) <= Number(form.price)) e.oldPrice = 'Giá gốc phải cao hơn giá bán'
    if (!form.imageBanner) e.imageBanner = 'Chọn ảnh đại diện'
    if (!form.categoryIds.length) e.categories = 'Chọn ít nhất một danh mục'
    if (!colors.length) e.colors = 'Thêm ít nhất một màu'
    colors.forEach((c) => {
      if (!c.colorName.trim()) e.colors = 'Màu nào cũng cần có tên'
      if (!c.sizes.length) e.colors = `Màu “${c.colorName || 'mới'}” chưa có size`
      c.sizes.forEach((s) => { if (!s.sizeName.trim()) e.colors = 'Size nào cũng cần có tên' })
    })
    setErrors(e)
    return !Object.keys(e).length
  }

  const save = async (e) => {
    e.preventDefault()
    if (!validate()) return toast.error('Kiểm tra lại các ô được đánh dấu')
    setSaving(true)
    try {
      for (const sid of removed.sizes) await api.del('/api/product-size/admin/delete', { id: sid }).catch((er) => toast.error(`Không xóa được size: ${er.message}`))
      for (const cid of removed.colors) await api.del('/api/product-color/admin/delete', { id: cid }).catch((er) => toast.error(`Không xóa được màu: ${er.message}`))
      for (const iid of removed.images) await api.del('/api/product-image/admin/delete', { id: iid }).catch(() => {})
      const body = {
        id: product?.id,
        name: form.name.trim(),
        code: form.code.trim(),
        alias: product?.alias || '',
        price: Number(form.price),
        oldPrice: form.oldPrice === '' || Number(form.oldPrice) === 0 ? null : Number(form.oldPrice),
        imageBanner: form.imageBanner,
        description: form.description,
        listCategoryIds: form.categoryIds,
        linkLinkImages: images.filter((i) => !i.id).map((i) => i.link),
        colors: colors.map((c) => ({ id: c.id, colorName: c.colorName.trim(), linkImage: c.linkImage || null, size: c.sizes.map((s) => ({ id: s.id, sizeName: s.sizeName.trim(), quantity: Number(s.quantity) || 0 })) })),
      }
      const res = await api.post(isNew ? '/api/product/admin/create' : '/api/product/admin/update', body)
      toast.success(isNew ? 'Đã thêm sản phẩm' : 'Đã lưu thay đổi')
      navigate(isNew ? `/admin/products/${res.id}` : '/admin/products', { replace: isNew })
    } catch (er) {
      toast.error(er.message)
    } finally {
      setSaving(false)
    }
  }

  const pct = discountPercent(Number(form.price), Number(form.oldPrice))
  return (
    <form onSubmit={save} noValidate>
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" /> Sản phẩm</Link>
      <PageHeader title={isNew ? 'Thêm sản phẩm' : product.name}
        actions={<><Link to="/admin/products" className="btn btn-ghost btn-sm">Hủy</Link><button className="btn btn-primary btn-sm" disabled={saving}>{saving && <Spinner className="size-4" />} {isNew ? 'Thêm sản phẩm' : 'Lưu thay đổi'}</button></>} />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="Thông tin cơ bản">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tên sản phẩm" error={errors.name} className="sm:col-span-2"><input className="field" value={form.name} onChange={set('name')} /></Field>
              <Field label="Mã sản phẩm" error={errors.code}><input className="field" value={form.code} onChange={set('code')} /></Field>
              <div />
              <Field label="Giá bán (đ)" error={errors.price}><input className="field" type="number" min="0" step="1000" value={form.price} onChange={set('price')} /></Field>
              <Field label="Giá gốc (đ)" error={errors.oldPrice} hint={pct ? `Hiện nhãn giảm ${pct}% trên cửa hàng` : 'Bỏ trống nếu không giảm giá'}><input className="field" type="number" min="0" step="1000" value={form.oldPrice} onChange={set('oldPrice')} /></Field>
            </div>
            <div className="mt-4">
              <span className="label">Mô tả</span>
              <RichEditor value={form.description} onChange={set('description')} placeholder="Chất liệu, form dáng, hướng dẫn giặt…" />
            </div>
          </Panel>

          <Panel title="Màu và size" actions={<button type="button" className="btn btn-outline btn-sm" onClick={() => setColors((c) => [...c, newColor()])}><Plus className="size-4" /> Thêm màu</button>}>
            {errors.colors && <p className="mb-3 text-sm font-medium text-danger">{errors.colors}</p>}
            <div className="space-y-4">
              {colors.map((c) => (
                <div key={c.key} className="rounded-sm border border-line p-4">
                  <div className="flex gap-4">
                    <ImageField label="" value={c.linkImage} onChange={(v) => updateColor(c.key, { linkImage: v })} className="aspect-square w-20" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-end gap-2">
                        <Field label="Tên màu" className="flex-1"><input className="field h-10" value={c.colorName} onChange={(e) => updateColor(c.key, { colorName: e.target.value })} placeholder="Đen, Trắng kem…" /></Field>
                        <button type="button" className="btn btn-ghost btn-sm h-10 px-2 text-danger" onClick={() => removeColor(c)} aria-label="Xóa màu"><Trash2 className="size-4" /></button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {c.sizes.map((s) => (
                          <div key={s.key} className="flex items-center overflow-hidden rounded-sm border border-line">
                            <input className="h-9 w-14 border-r border-line bg-mist px-2 text-center text-sm font-semibold outline-none focus:bg-paper" value={s.sizeName} onChange={(e) => updateSize(c.key, s.key, { sizeName: e.target.value })} aria-label="Tên size" />
                            <input className="h-9 w-16 px-2 text-sm outline-none" type="number" min="0" value={s.quantity} onChange={(e) => updateSize(c.key, s.key, { quantity: e.target.value })} aria-label={`Số lượng size ${s.sizeName}`} />
                            <button type="button" className="grid h-9 w-7 place-items-center text-muted hover:text-danger" onClick={() => removeSize(c.key, s)} aria-label="Xóa size"><X className="size-3.5" /></button>
                          </div>
                        ))}
                        <button type="button" className="h-9 rounded-sm border border-dashed border-line px-3 text-sm font-medium text-muted hover:border-ink hover:text-ink"
                          onClick={() => { const used = c.sizes.map((s) => s.sizeName); updateColor(c.key, { sizes: [...c.sizes, newSize(PRESET_SIZES.find((x) => !used.includes(x)) || '')] }) }}>+ Size</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Số lượng ở đây là tồn kho hiện tại. Khi nhập thêm hàng, dùng mục Nhập hàng để có lịch sử nhập.</p>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Ảnh">
            <ImageField label="Ảnh đại diện" value={form.imageBanner} onChange={set('imageBanner')} className="aspect-[4/5] w-full" />
            {errors.imageBanner && <p className="mt-1 text-xs font-medium text-danger">{errors.imageBanner}</p>}
            <span className="label mt-5">Ảnh khác</span>
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <div key={img.id || img.link} className="relative">
                  <img src={img.link} alt="" className="aspect-square w-24 rounded-sm object-cover" />
                  <button type="button" className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-paper/90 shadow" aria-label="Xóa ảnh"
                    onClick={() => { setImages((l) => l.filter((x) => x !== img)); if (img.id) setRemoved((r) => ({ ...r, images: [...r.images, img.id] })) }}><X className="size-3.5" /></button>
                </div>
              ))}
              <MultiImageButton onAdd={(links) => setImages((l) => [...l, ...links.map((link) => ({ link }))])} />
            </div>
          </Panel>
          <Panel title="Danh mục">
            {errors.categories && <p className="mb-2 text-sm font-medium text-danger">{errors.categories}</p>}
            <div className="space-y-3">
              {tree.map((p) => (
                <div key={p.id}>
                  <CatCheck checked={form.categoryIds.includes(p.id)} onChange={() => toggleCat(p.id)} label={p.name} strong />
                  <div className="ml-6 mt-1 space-y-1">{p.children.map((c) => <CatCheck key={c.id} checked={form.categoryIds.includes(c.id)} onChange={() => toggleCat(c.id)} label={c.name} />)}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </form>
  )
}

function CatCheck({ checked, onChange, label, strong }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" className="size-4 accent-ink" checked={checked} onChange={onChange} />
      <span className={cx(strong ? 'font-semibold' : 'text-ink-soft')}>{label}</span>
    </label>
  )
}
