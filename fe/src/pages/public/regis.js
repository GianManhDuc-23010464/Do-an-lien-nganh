import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {postMethodPayload, postMethodTextPlan} from '../../services/request'
import Swal from 'sweetalert2'

async function regisAction(event) {
    event.preventDefault();
    var email = document.getElementById("email").value
    var fullname = document.getElementById("fullname").value
    var phone = document.getElementById("phone").value
    var password = document.getElementById("password").value
    var repassword = document.getElementById("repassword").value
    if(password != repassword){
        toast.error("Mật khẩu không trùng khớp")
        return;
    }
    var user = {
        "fullname": fullname,
        "email": email,
        "phone": phone,
        "password": password
    }
    const response = await postMethodPayload('/api/regis', user)
    var result = await response.json();
    if (response.status < 300) {
        Swal.fire({
            title: "Thông báo",
            text: "đăng ký thành công! hãy check email của bạn!",
            preConfirm: () => {
                window.location.href = 'confirm?email=' + result.email
            }
        });
    }
    if (response.status == 417) {
        toast.warning(result.defaultMessage);
    }
}
function regis(){

    return(
    <div class="content contentlogin" style={{backgroundImage:'url(image/bg_login.webp)'}}>
       <div class="loginform col-lg-7 col-md-7 col-sm-12 col-12">
            <p class="plogintl"><span class="dangtl">ĐĂNG </span><span class="kytl">KÝ</span></p>
            <form onSubmit={regisAction} class="inputloginform" >
                <input id="fullname" placeholder="Họ tên" class="inputform"/>
                <input id="phone" placeholder="Số điện thoại" class="inputform"/>
                <input id="email" placeholder="Địa chỉ email" class="inputform" type="email" required/>
                <input id="password" placeholder="Mật khẩu" class="inputform" type="password" required/>
                <input id="repassword" placeholder="Nhập lại mật khẩu" class="inputform" type="password" required/>
                <button class="btndn">Đăng Ký</button>
                <p class="nothvaccount"><span>Bạn đã có tài khoản? </span><a href="login" class="aquenmk">Đăng nhập ngay</a></p>
            </form>
        </div>
    </div>
    );
}
export default regis;