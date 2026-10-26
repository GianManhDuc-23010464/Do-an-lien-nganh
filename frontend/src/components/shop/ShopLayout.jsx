import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function ShopLayout() {
  const { pathname } = useLocation()
  const ownBar = /^\/(cart|checkout)/.test(pathname)
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 btn btn-dark">Bỏ qua tới nội dung</a>
      <Header />
      <main id="main" className="flex-1"><Outlet /></main>
      <div className={ownBar ? 'hidden md:block' : ''}><Footer /></div>
    </div>
  )
}
