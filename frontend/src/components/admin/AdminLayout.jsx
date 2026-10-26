import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, FileText, FolderTree, Image, LogOut, Menu, PackagePlus, Receipt, Shirt, Store, TicketPercent, Users, X } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import { cx } from '../ui'

const NAV = [
  ['/admin', 'Tổng quan', BarChart3, true],
  ['/admin/orders', 'Đơn hàng', Receipt],
  ['/admin/products', 'Sản phẩm', Shirt],
  ['/admin/categories', 'Danh mục', FolderTree],
  ['/admin/imports', 'Nhập hàng', PackagePlus],
  ['/admin/vouchers', 'Mã giảm giá', TicketPercent],
  ['/admin/banners', 'Banner', Image],
  ['/admin/blogs', 'Bài viết', FileText],
  ['/admin/users', 'Người dùng', Users],
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(0)

  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    api.get('/api/statistic/admin/dashboard').then((d) => setPending(d?.ordersPending || 0)).catch(() => {})
  }, [location.pathname])

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-paper/75">
      <Link to="/admin" className="flex items-center gap-2 px-6 py-5">
        <span className="text-lg font-semibold tracking-[0.28em] text-white">MADU</span>
        <span className="text-xs text-white/50">Quản trị</span>
      </Link>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label="Quản trị">
        {NAV.map(([to, label, Icon, end]) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cx('flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white')}>
            <Icon className="size-[18px]" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            {to === '/admin/orders' && pending > 0 && <span className="rounded-full bg-brand px-2 text-xs font-semibold text-white">{pending}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-paper/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm hover:bg-paper/10 hover:text-paper"><Store className="size-[18px]" /> Xem cửa hàng</Link>
        <button onClick={() => { logout(); navigate('/login') }} className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm hover:bg-paper/10 hover:text-paper"><LogOut className="size-[18px]" /> Đăng xuất</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="relative h-full w-64" onClick={(e) => e.stopPropagation()}>
            {sidebar}
            <button className="absolute right-2 top-4 p-2 text-paper" onClick={() => setOpen(false)} aria-label="Đóng menu"><X className="size-5" /></button>
          </aside>
        </div>
      )}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-paper px-4 sm:px-6">
          <button className="btn btn-ghost btn-sm -ml-2 px-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Mở menu"><Menu className="size-5" /></button>
          <span className="flex-1" />
          <span className="text-sm text-ink-soft">{user?.fullname || user?.email}</span>
          <span className="grid size-8 place-items-center rounded-full bg-mist text-sm font-semibold text-ink">{(user?.fullname || 'A')[0]}</span>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
