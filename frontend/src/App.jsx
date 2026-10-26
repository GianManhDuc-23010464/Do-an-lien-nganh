import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './lib/auth'
import { CartProvider } from './lib/cart'
import { api } from './lib/api'
import { ConfirmProvider, PageLoader } from './components/ui'
import ShopLayout from './components/shop/ShopLayout'
import Home from './pages/shop/Home'
import Products from './pages/shop/Products'
import ProductDetail from './pages/shop/ProductDetail'
import Cart from './pages/shop/Cart'
import { Confirm, Forgot, Login, Register } from './pages/auth/AuthPages'
import { About, NotFound } from './pages/shop/Static'

// Các trang ít dùng hơn được tải khi cần để trang chủ nhẹ
const Checkout = lazy(() => import('./pages/shop/Checkout'))
const ShopCategories = lazy(() => import('./pages/shop/Categories'))
const PaymentResult = lazy(() => import('./pages/shop/PaymentResult'))
const OrderDetail = lazy(() => import('./pages/shop/OrderDetail'))
const AccountPages = lazy(() => import('./pages/shop/Account').then((m) => ({ default: m.AccountLayout })))
const Orders = lazy(() => import('./pages/shop/Account').then((m) => ({ default: m.Orders })))
const Addresses = lazy(() => import('./pages/shop/Account').then((m) => ({ default: m.Addresses })))
const Profile = lazy(() => import('./pages/shop/Account').then((m) => ({ default: m.Profile })))
const BlogList = lazy(() => import('./pages/shop/Blog').then((m) => ({ default: m.BlogList })))
const BlogDetail = lazy(() => import('./pages/shop/Blog').then((m) => ({ default: m.BlogDetail })))

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const ProductForm = lazy(() => import('./pages/admin/ProductForm'))
const Categories = lazy(() => import('./pages/admin/Categories'))
const Imports = lazy(() => import('./pages/admin/Imports'))
const Vouchers = lazy(() => import('./pages/admin/Vouchers'))
const Banners = lazy(() => import('./pages/admin/Banners'))
const Blogs = lazy(() => import('./pages/admin/Blogs'))
const Users = lazy(() => import('./pages/admin/Users'))

function RequireUser({ children }) {
  const { isLoggedIn, isAdmin } = useAuth()
  const location = useLocation()
  if (!isLoggedIn) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  if (isAdmin) return <Navigate to="/admin" replace />
  return children
}

/** Chặn trang admin: kiểm tra quyền ở cả trình duyệt lẫn server (token có thể đã bị thu hồi). */
function RequireAdmin({ children }) {
  const { isLoggedIn, isAdmin, logout } = useAuth()
  const location = useLocation()
  const [ok, setOk] = useState(null)
  useEffect(() => {
    if (!isAdmin) return
    api.get('/api/admin/check-role-admin').then(() => setOk(true)).catch(() => { setOk(false); logout() })
  }, [isAdmin, logout])
  if (!isLoggedIn || !isAdmin || ok === false) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (ok === null) return <PageLoader label="Đang kiểm tra quyền…" />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ConfirmProvider>
            <ScrollToTop />
            <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: 'var(--font-sans)', borderRadius: 2 } }} />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<ShopLayout />}>
                  <Route index element={<Home />} />
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<ShopCategories />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<RequireUser><Checkout /></RequireUser>} />
                  <Route path="payment/result" element={<RequireUser><PaymentResult /></RequireUser>} />
                  <Route path="account" element={<RequireUser><AccountPages /></RequireUser>}>
                    <Route index element={<Profile />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/:id" element={<OrderDetail />} />
                    <Route path="addresses" element={<Addresses />} />
                  </Route>
                  <Route path="orders/:id" element={<LegacyOrderRedirect />} />
                  <Route path="blog" element={<BlogList />} />
                  <Route path="blog/:id" element={<BlogDetail />} />
                  <Route path="about" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="confirm" element={<Confirm />} />
                <Route path="forgot" element={<Forgot />} />
                <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/:id" element={<ProductForm />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="imports" element={<Imports />} />
                  <Route path="vouchers" element={<Vouchers />} />
                  <Route path="banners" element={<Banners />} />
                  <Route path="blogs" element={<Blogs />} />
                  <Route path="users" element={<Users />} />
                </Route>
              </Routes>
            </Suspense>
          </ConfirmProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

// Link trong email cũ dạng /orders/:id
function LegacyOrderRedirect() {
  const { pathname } = useLocation()
  return <Navigate to={'/account' + pathname} replace />
}
