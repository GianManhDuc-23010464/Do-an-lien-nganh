import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {postMethodPayload, postMethodTextPlan} from '../../services/request'
import Swal from 'sweetalert2'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';


const PolicyContent = () => {
    return (
      <div className="content contentlogin">
        <div className="row">
          <div className="col-sm-1"></div>
          <div className="col-lg-10 pull-center">
            <br />
            <br />
            <p style={{ textIndent: "30px" }}>
              Nhằm đáp ứng tốt hơn nhu cầu của khách hàng và nâng cao chất lượng dịch vụ thì số lượng của từng sản phẩm trong cửa hàng mà khách hàng muốn mua tối đa chỉ 20 sản phẩm. Đối với các khách hàng muốn mua số lượng lớn đối với từng sản phẩm thì vui lòng liên hệ trực tiếp đến cửa hàng để được tư vấn. Swispshop cung cấp cho khách hàng chính sách: “Đổi trả hàng”. Mục đích của chính sách đổi trả này là cung cấp thêm cho khách hàng về dịch vụ sau bán hàng nhằm đem lại nhiều lợi ích và sự yên tâm cho quý khách hàng khi sử dụng sản phẩm của Swispshop.
            </p>
            <br />
            <div>
              <b>Chính sách đổi trả hàng:</b> Để đảm bảo sự hài lòng tuyệt đối của khách hàng khi mua sắm tại Swispshop, chúng tôi bảo hành sản phẩm trong, 6 tháng, 12 tháng tùy từng sản phẩm.
            </div>
            <br />
            <p style={{ textIndent: "30px" }}>
              Tất cả các sản phẩm đều được bảo hành lỗi 1 đổi 1 trong vòng 7 ngày kể từ khi khách hàng nhận sản phẩm.
            </p>
            <p>Một số điều kiện có thể đi kèm, quý khách vui lòng tham khảo thông tin chi tiết bên dưới:</p>
            <br />
            <h3 dir="ltr"><b>I. Trường hợp được đổi / trả hàng</b></h3>
            <div style={{ marginLeft: "20px" }}>
              <p dir="ltr"><b>a. Sản phẩm mua bị lỗi sản xuất</b></p>
              <p style={{ textIndent: "30px" }} dir="ltr">
                Quý khách vui lòng kiểm tra sản phẩm trước khi thanh toán. Sản phẩm của Swispshop trước khi gửi đi cho khách luôn luôn được kiểm tra rất kỹ càng qua 2 khâu:
              </p>
              <ul>
                <li>Sản phẩm vừa ra lò: Kiểm tra về men màu, có đều không? có bị lỗi men không? có bị ngấm nước không ?…</li>
                <li>Trước khi đóng hàng cho khách. Nhân viên đóng hàng sẽ kiểm tra lại các bước của khâu 1 để đảm bảo chắc chắn rằng sản phẩm tới tay khách hàng luôn luôn đẹp nhất.</li>
              </ul>
              <p dir="ltr"><b>b. Sản phẩm bị vỡ hỏng trong quá trình vận chuyển.</b></p>
              <p style={{ textIndent: "30px" }} dir="ltr">
                Trong trường hợp sản phẩm bị hư hại trong quá trình vận chuyển, quý khách vui lòng từ chối và gửi lại sản phẩm cho Swispshop. Đồng thời thông báo cho nhân viên chăm sóc khách hàng của Swispshop chúng tôi sẽ gửi bù sản phẩm mới thay thế.
              </p>
              <p dir="ltr"><b>c. Sản phẩm giao không đúng theo đơn đặt hàng</b></p>
              <p style={{ textIndent: "30px" }} dir="ltr">
                Quý khách nhận hàng kiểm tra sản phẩm và nghĩ rằng sản phẩm giao cho bạn không đúng với đơn đặt hàng? Hãy liên hệ với chúng tôi càng sớm càng tốt, nhân viên CSKH sẽ kiểm tra nếu hàng của bạn bị gửi nhầm. Chúng tôi sẽ thay thế đúng sản phẩm mà bạn đã đặt hàng.
              </p>
            </div>
            <br />
            <h3 dir="ltr"><b>II. Điều kiện đổi trả hàng</b></h3>
            <p dir="ltr"><b>Điều kiện về thời gian đổi trả: trong vòng 5 ngày kể từ khi nhận được hàng.</b></p>
            <p style={{ textIndent: "30px" }} dir="ltr">
              Khách hàng cung cấp được 1 trong những thông tin sau: Hóa đơn mua hàng tại Swispshop(nếu có), SĐT đặt hàng chính xác khi mua hàng, chúng tôi sẽ kiểm tra lịch sử mua hàng của bạn trên hệ thống phần mềm của Swispshop.
            </p>
            <p dir="ltr"><strong><em>Điều kiện về sản phẩm: hàng hóa còn đầy đủ các bộ phận không nứt vỡ, không có dấu hiệu sử dụng.</em></strong></p>
            <br />
            <h3 dir="ltr"><b>III. Quy trình đổi trả hàng</b></h3>
            <ol>
              <li>
                Liên hệ Trung tâm hỗ trợ khách hàng – Hotline: 0995 625 354 để thông báo về yêu cầu đổi, trả hàng. Quý khách cần chuẩn bị trước số điện thoại mua hàng, sản phẩm đã mua và ngày mua.
              </li>
              <li>
                Sau khi Trung tâm hỗ trợ khách hàng tiếp nhận thông tin sẽ hướng dẫn cho quý khách địa điểm đổi trả hàng gần nhất. Quý khách có thể mang sản phẩm đến cửa hàng hoặc gửi chuyển phát nhanh về cửa hàng để đổi trả hàng.
              </li>
            </ol>
            <br />
            <p dir="ltr"><b>Cảm ơn quý khách!</b></p>
          </div>
          <div className="col-sm-1"></div>
        </div>
      </div>
    );
  };
  
  export default PolicyContent;
  