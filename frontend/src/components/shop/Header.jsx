import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutDashboard, LayoutGrid, LogOut, Package, Search, ShoppingBag, User } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../../lib/auth'
import { useCart } from '../../lib/cart'
import { api } from '../../lib/api'
import { cx } from '../ui'

export default function Header() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/api/category/public/findPrimaryCategory').then((c) => setCategories(c || [])).catch(() => {})
  }, [])
  useEffect(() => { setMenu(false) }, [location.pathname, location.search])

  const submit = (e) => {
    e.preventDefault()
    navigate(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products')
  }

  // Giỏ hàng / thanh toán trên điện thoại có thanh tiêu đề riêng (như app), ẩn header chung
  const ownBar = /^\/(cart|checkout)/.test(location.pathname)
  return (
    <>
      <div className={cx('bg-mist text-center text-xs text-ink-soft', ownBar && 'hidden md:block')}>
        <p className="container-x py-2"><span className="hidden sm:inline">Phí giao hàng đồng giá 20.000đ toàn quốc. Đổi size miễn phí trong 7 ngày.</span><span className="sm:hidden">Ship đồng giá 20.000đ, đổi size trong 7 ngày</span></p>
      </div>
      <header className={cx('sticky top-0 z-40 border-b border-line bg-paper', ownBar && 'hidden md:block')}>
        <div className="container-x flex h-16 items-center gap-6">
          <Logo className="shrink-0" />
          <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Danh mục">
            {categories.slice(0, 6).map((c) => <TopLink key={c.id} to={`/products?category=${c.id}`}>{c.name}</TopLink>)}
            <TopLink to="/products?sort=new">Hàng mới</TopLink>
            <TopLink to="/products?sort=sale" className="text-brand">Ưu đãi</TopLink>
          </nav>
          <form onSubmit={submit} className="relative ml-auto w-full max-w-[260px] flex-1 lg:flex-none" role="search">
            <input className="field h-9 bg-mist pr-9 border-transparent" placeholder="Tìm sản phẩm" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm sản phẩm" />
            <button className="absolute right-0 top-0 grid size-9 place-items-center text-muted" aria-label="Tìm"><Search className="size-4" /></button>
          </form>
          <div className="hidden items-center gap-1 md:flex">
            {isLoggedIn ? (
              <div className="relative">
                <button className="flex items-center gap-2 px-2 py-2 text-[13px] hover:text-brand" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-haspopup="menu">
                  <User className="size-5" /> <span className="max-w-28 truncate">{user.fullname || user.email}</span>
                </button>
                {menu && (
                  <div role="menu" className="absolute right-0 mt-1 w-52 border border-line bg-paper py-1 shadow-lg">
                    {isAdmin && <MenuLink to="/admin" icon={LayoutDashboard}>Trang quản trị</MenuLink>}
                    {!isAdmin && <MenuLink to="/account/orders" icon={Package}>Đơn mua</MenuLink>}
                    {!isAdmin && <MenuLink to="/account" icon={User}>Tài khoản của tôi</MenuLink>}
                    <button role="menuitem" className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] hover:bg-mist" onClick={() => { logout(); navigate('/') }}>
                      <LogOut className="size-4 text-muted" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-2 py-2 text-[13px] hover:text-brand"><User className="size-5" /> Đăng nhập</Link>
            )}
            {!isAdmin && <CartLink count={count} />}
          </div>
          <div className="md:hidden">{!isAdmin && <CartLink count={count} />}</div>
        </div>
      </header>
      <BottomNav count={count} isAdmin={isAdmin} />
    </>
  )
}

function CartLink({ count }) {
  return (
    <Link to="/cart" className="relative grid size-10 place-items-center hover:text-brand" aria-label={`Giỏ hàng, ${count} sản phẩm`}>
      <ShoppingBag className="size-5" />
      {count > 0 && <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">{count > 99 ? '99+' : count}</span>}
    </Link>
  )
}

/** Thanh điều hướng dưới đáy màn hình trên điện thoại, giống app mua sắm */
function BottomNav({ count, isAdmin }) {
  const { pathname } = useLocation()
  // Các màn hình có thanh hành động riêng ở đáy (như các app mua sắm) thì ẩn thanh điều hướng
  if (/^\/(product\/|cart|checkout|payment)/.test(pathname) || /^\/account\/orders\/./.test(pathname)) return null
  const items = [
    ['/', 'Trang chủ', Home, true],
    ['/categories', 'Danh mục', LayoutGrid],
    ['/cart', 'Giỏ hàng', ShoppingBag],
    [isAdmin ? '/admin' : '/account', isAdmin ? 'Quản trị' : 'Tôi', User],
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Điều hướng chính">
      {items.map(([to, label, Icon, end]) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => cx('relative flex flex-col items-center gap-0.5 py-2 text-[11px]', isActive ? 'text-brand' : 'text-muted')}>
          <Icon className="size-5" aria-hidden="true" />
          {label}
          {to === '/cart' && count > 0 && <span className="absolute left-1/2 top-1 ml-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">{count}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

function TopLink({ to, children, className }) {
  const location = useLocation()
  const active = location.pathname + location.search === to
  return (
    <NavLink to={to} className={cx('px-3 py-2 text-[13px] transition-colors hover:text-brand', active ? 'font-semibold text-ink' : 'text-ink-soft', className)}>
      {children}
    </NavLink>
  )
}

function MenuLink({ to, icon: Icon, children }) {
  return (
    <Link role="menuitem" to={to} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-mist">
      <Icon className="size-4 text-muted" /> {children}
    </Link>
  )
}
