import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useDocumentTitle } from '../../lib/hooks'
import { Empty } from '../../components/ui'

const POLICIES = [
  ['Giao hàng', 'Phí ship đồng giá 20.000đ cho mọi đơn. Nội thành Hà Nội và TP.HCM nhận trong 1–2 ngày, các tỉnh khác 3–5 ngày. Bạn được mở hộp kiểm tra trước khi trả tiền.'],
  ['Đổi size, đổi mẫu', 'Đổi miễn phí trong 7 ngày kể từ khi nhận hàng nếu sản phẩm còn tem mác và chưa qua sử dụng. Liên hệ hotline hoặc nhắn fanpage để được hướng dẫn gửi lại.'],
  ['Hủy đơn', 'Bạn tự hủy được đơn khi shop chưa xác nhận, ngay trong mục Đơn hàng của tôi. Đơn đã thanh toán online cần liên hệ shop để hủy và hoàn tiền trong 3–7 ngày làm việc.'],
  ['Thanh toán', 'Nhận tiền mặt khi giao (COD), ví MoMo hoặc VNPay (thẻ ATM, Visa, QR ngân hàng). Đơn thanh toán online được giữ hàng 30 phút.'],
  ['Bảo mật thông tin', 'Thông tin của bạn chỉ dùng để giao hàng và chăm sóc khách hàng. Chúng tôi không lưu thông tin thẻ, mọi giao dịch được xử lý tại cổng thanh toán.'],
]

export function About() {
  useDocumentTitle('Chính sách')
  return (
    <div className="container-x max-w-3xl pt-8">
      <h1 className="text-2xl font-semibold md:text-[26px]">Chính sách mua hàng</h1>
      <p className="mt-3 text-lg text-ink-soft">Ngắn gọn để bạn yên tâm đặt hàng.</p>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {POLICIES.map(([t, d]) => (
          <section key={t} className="grid gap-2 py-6 md:grid-cols-[200px_1fr]">
            <h2 className="text-lg font-bold">{t}</h2>
            <p className="text-ink-soft">{d}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

export function NotFound() {
  useDocumentTitle('Không tìm thấy trang')
  return (
    <div className="container-x py-10">
      <Empty icon={Compass} title="Trang này không tồn tại" action={<Link to="/" className="btn btn-primary">Về trang chủ</Link>}>
        Có thể đường dẫn đã cũ hoặc bị gõ nhầm.
      </Empty>
    </div>
  )
}
