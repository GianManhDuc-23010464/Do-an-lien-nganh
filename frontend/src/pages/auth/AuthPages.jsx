import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useDocumentTitle } from '../../lib/hooks'
import Logo from '../../components/shop/Logo'
import { Field, Spinner } from '../../components/ui'

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <header className="border-b border-line bg-paper">
        <div className="container-x flex h-16 items-center gap-4"><Logo /><span className="text-[15px] text-ink-soft">{title}</span></div>
      </header>
      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-[420px] border border-line bg-paper p-6 sm:p-8">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[13px] text-ink-soft">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-line pt-5 text-center text-[13px] text-ink-soft">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

export function Login() {
  useDocumentTitle('Đăng nhập')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ username: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [notActive, setNotActive] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNotActive(false)
    try {
      const user = await login(form.username.trim(), form.password)
      toast.success(`Chào ${user.fullname || ''}!`)
      const next = params.get('next')
      navigate(user.authorities?.name === 'ROLE_ADMIN' ? (next?.startsWith('/admin') ? next : '/admin') : next || '/', { replace: true })
    } catch (err) {
      if (err.data?.errorCode === 300) setNotActive(true)
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Đăng nhập" subtitle="Theo dõi đơn hàng và lưu giỏ hàng trên mọi thiết bị."
      footer={<>Chưa có tài khoản? <Link to="/register" className="font-medium text-brand hover:underline">Đăng ký</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><input className="field" type="email" autoComplete="username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
        <Field label="Mật khẩu"><input className="field" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <div className="text-right text-sm"><Link to="/forgot" className="text-ink-soft hover:text-brand">Quên mật khẩu?</Link></div>
        {notActive && (
          <p className="rounded-sm bg-warning-soft p-3 text-sm">Tài khoản chưa kích hoạt. <Link className="font-semibold underline" to={`/confirm?email=${encodeURIComponent(form.username)}`}>Nhập mã kích hoạt</Link></p>
        )}
        <button className="btn btn-primary w-full" disabled={busy}>{busy && <Spinner />} Đăng nhập</button>
      </form>
    </AuthShell>
  )
}

export function Register() {
  useDocumentTitle('Đăng ký')
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullname: '', email: '', phone: '', password: '', again: '' })
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!form.fullname.trim()) er.fullname = 'Nhập họ tên'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Email không hợp lệ'
    if (form.phone && !/^0\d{9}$/.test(form.phone)) er.phone = 'Số điện thoại gồm 10 số'
    if (form.password.length < 6) er.password = 'Tối thiểu 6 ký tự'
    if (form.password !== form.again) er.again = 'Mật khẩu nhập lại không khớp'
    setErr(er)
    if (Object.keys(er).length) return
    setBusy(true)
    try {
      await api.post('/api/regis', { fullname: form.fullname.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password })
      toast.success('Đã gửi mã kích hoạt tới email của bạn')
      navigate(`/confirm?email=${encodeURIComponent(form.email.trim())}`)
    } catch (e2) {
      if (e2.data?.errorCode === 330) navigate(`/confirm?email=${encodeURIComponent(form.email.trim())}`)
      toast.error(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Tạo tài khoản" footer={<>Đã có tài khoản? <Link to="/login" className="font-medium text-brand hover:underline">Đăng nhập</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Họ tên" error={err.fullname}><input className="field" autoComplete="name" value={form.fullname} onChange={set('fullname')} /></Field>
        <Field label="Email" error={err.email}><input className="field" type="email" autoComplete="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Số điện thoại" error={err.phone} hint="Không bắt buộc"><input className="field" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mật khẩu" error={err.password}><input className="field" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} /></Field>
          <Field label="Nhập lại" error={err.again}><input className="field" type="password" autoComplete="new-password" value={form.again} onChange={set('again')} /></Field>
        </div>
        <button className="btn btn-primary w-full" disabled={busy}>{busy && <Spinner />} Đăng ký</button>
      </form>
    </AuthShell>
  )
}

export function Confirm() {
  useDocumentTitle('Kích hoạt tài khoản')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') || '')
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/api/active-account', undefined, { email: email.trim(), key: key.trim() })
      toast.success('Kích hoạt thành công, mời bạn đăng nhập')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthShell title="Kích hoạt tài khoản" subtitle="Nhập mã 6 số chúng tôi vừa gửi tới email của bạn.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Mã kích hoạt"><input className="field text-center text-2xl tracking-[0.4em]" inputMode="numeric" maxLength={6} required value={key} onChange={(e) => setKey(e.target.value.replace(/\D/g, ''))} /></Field>
        <button className="btn btn-primary w-full" disabled={busy}>{busy && <Spinner />} Kích hoạt</button>
      </form>
    </AuthShell>
  )
}

export function Forgot() {
  useDocumentTitle('Quên mật khẩu')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/api/forgot-password', undefined, { email: email.trim() })
      setSent(true)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthShell title="Quên mật khẩu" subtitle="Chúng tôi sẽ gửi mật khẩu mới tới email của bạn."
      footer={<Link to="/login" className="font-medium text-brand hover:underline">Quay lại đăng nhập</Link>}>
      {sent ? (
        <p className="rounded-sm bg-success-soft p-4 text-success">Đã gửi mật khẩu mới tới <strong>{email}</strong>. Hãy đăng nhập rồi đổi mật khẩu trong mục Tài khoản.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email"><input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <button className="btn btn-primary w-full" disabled={busy}>{busy && <Spinner />} Gửi mật khẩu mới</button>
        </form>
      )}
    </AuthShell>
  )
}
