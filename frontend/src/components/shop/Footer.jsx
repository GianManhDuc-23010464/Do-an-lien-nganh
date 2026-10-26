import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-mist pb-16 md:pb-0">
      <div className="container-x grid gap-10 py-12 text-[13px] sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs leading-relaxed text-ink-soft">Quần áo đơn giản, chất liệu dễ chịu, mặc được mỗi ngày và bền qua nhiều mùa.</p>
        </div>
        <FooterCol title="Mua sắm" links={[['Tất cả sản phẩm', '/products'], ['Hàng mới', '/products?sort=new'], ['Ưu đãi', '/products?sort=sale']]} />
        <FooterCol title="Hỗ trợ khách hàng" links={[['Đơn mua', '/account/orders'], ['Chính sách đổi trả', '/about'], ['Câu chuyện MADU', '/blog']]} />
        <div>
          <h3 className="text-[13px] font-semibold">Liên hệ</h3>
          <p className="mt-3 text-ink-soft">Hotline 1900 0000<br />8:00 – 21:00 mỗi ngày</p>
          <p className="mt-3 text-ink-soft">Thanh toán: COD, MoMo, VNPay</p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x py-4 text-xs text-muted">© {new Date().getFullYear()} MADU</div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-ink-soft">
        {links.map(([l, to]) => <li key={to}><Link to={to} className="hover:text-brand">{l}</Link></li>)}
      </ul>
    </div>
  )
}
