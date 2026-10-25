import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {postMethod, postMethodPayload, postMethodTextPlan} from '../../services/request'
import Swal from 'sweetalert2'

async function regisAction(event) {
    event.preventDefault();
    var uls = new URL(document.URL)
    var email = uls.searchParams.get("email");
    var key = document.getElementById("maxacthuc").value;
    const res = await postMethod('/api/active-account?email=' + email + '&key=' + key)
    if (res.status < 300) {
        Swal.fire({
            title: "Thông báo",
            text: "Xác nhận tài khoản thành công!",
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
function Confirm(){

    return(
    <div class="content contentlogin" style={{backgroundImage:'url(image/bg_login.webp)'}}>
       <div class="loginform col-lg-7 col-md-7 col-sm-12 col-12">
            <br/><br/>
            <p class="plogintl"><span class="dangtl">XÁC THỰC </span><span class="kytl">TÀI KHOẢN</span></p>
            <p class="noteregis">Chúng tôi đã gửi mã xác thực 6 số cho bạn, hãy nhập mã xác thực để kích hoạt tài khoản</p>
            <form onSubmit={regisAction} class="inputloginform">
                <input id="maxacthuc" placeholder="Nhập mã xác thực" class="inputform"/>
                <button type="button" class="btnhuylogin" onclick="window.location.href='login'">HỦY</button>
                <button type="submit" class="btntt">Xác thực</button>
            </form><br/><br/>
        </div>
    </div>
    );
}
export default Confirm;