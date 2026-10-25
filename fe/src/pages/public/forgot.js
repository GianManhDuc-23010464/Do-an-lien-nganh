import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {postMethod, postMethodPayload, postMethodTextPlan} from '../../services/request'
import Swal from 'sweetalert2'

async function requestForgot(event) {
    event.preventDefault();
    var email = document.getElementById("email").value
    const res = await postMethod('/api/forgot-password?email=' + email)
    if (res.status < 300) {
        Swal.fire({
            title: "Thông báo",
            text: "Kiểm tra email của bạn!",
            preConfirm: () => {
                window.location.href = 'login'
            }
        });
    }
    if (res.status == 417) {
        var result = await res.json()
        toast.warning(result.defaultMessage);
    }
}
function Forgot(){

    return(
    <div class="content contentlogin" style={{backgroundImage:'url(image/bg_login.webp)'}}>
       <div class="loginform col-lg-7 col-md-7 col-sm-12 col-12">
            <br/><br/>
            <p class="plogintl"><span class="dangtl">QUÊN </span><span class="kytl">MẬT KHẨU</span></p>
            <p class="noteregis">Nếu bạn quên mật khẩu, vui lòng nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.</p>
            <form onSubmit={requestForgot} class="inputloginform" action="javascript:forgorPassword()">
                <input id="email" placeholder="Nhập email" class="inputform"/>
                <button type="button" class="btnhuylogin" onClick={()=>window.location.href='login'}>HỦY</button>
                <button type="submit" class="btntt">TIẾP TỤC</button>
            </form><br/><br/>
        </div>
    </div>
    );
}
export default Forgot;