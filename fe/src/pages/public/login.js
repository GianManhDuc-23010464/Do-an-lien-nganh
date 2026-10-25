import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {postMethodPayload, postMethodTextPlan} from '../../services/request'
import Swal from 'sweetalert2'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';

async function handleLogin(event) {
    event.preventDefault();
    const payload = {
        username: event.target.elements.username.value,
        password: event.target.elements.password.value
    };
    
    const res = await postMethodPayload('/api/login', payload);
    
    var result = await res.json()
    console.log(result);
    if (res.status == 417) {
        if (result.errorCode == 300) {
            Swal.fire({
                title: "Thông báo",
                text: "Tài khoản chưa được kích hoạt, đi tới kích hoạt tài khoản!",
                preConfirm: () => {
                    window.location.href = 'confirm?email=' + event.target.elements.username.value
                }
            });
        } else {
            toast.warning(result.defaultMessage);
        }
    }
    if(res.status < 300){
        processLogin(result.user, result.token)
    }
};

async function processLogin(user, token) {
    toast.success('Đăng nhập thành công!');
    await new Promise(resolve => setTimeout(resolve, 1500));
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    if (user.authorities.name === "ROLE_ADMIN") {
        window.location.href = 'admin/index';
    }
    if (user.authorities.name === "ROLE_USER") {
        window.location.href = 'index';
    }
}


function login(){
    const handleLoginSuccess = async (accessToken) => {
        console.log(accessToken);
        
        var response = await postMethodTextPlan('/api/login/google', accessToken.credential)
        var result = await response.json();
        if (response.status < 300) {
            processLogin(result.user, result.token)
        }
        if (response.status == 417) {
            toast.warning(result.defaultMessage);
        }
    };
    
    const handleLoginError = () => {
        toast.error("Đăng nhập google thất bại")
    };

    return(
        <>
         <div class="content contentlogin" style={{backgroundImage:'url(image/bg_login.webp)'}}>
        <div class="loginform col-lg-7 col-md-7 col-sm-12 col-12">
            <p class="plogintl"><span class="dangtl">ĐĂNG </span><span class="kytl">NHẬP</span></p>
            <form onSubmit={handleLogin} autocomplete="on" class="inputloginform">
                <input name="username" id="username" placeholder="Email" class="inputform"/>
                <input name="password" required id="password" placeholder="Mật khẩu" class="inputform" type="password"/>
                <button type="submit" class="btndn">Đăng Nhập</button>
                <p class="linkquenmk"><a href="forgot" class="aquenmk">Quên mật khẩu</a></p>
                <p class="nothvaccount"><span>Bạn chưa có tài khoản? </span><a href="regis" class="aquenmk">Đăng ký ngay</a></p>
            </form>
            <hr/>
            <div class="parentlogingg">
                <GoogleOAuthProvider clientId="663646080535-l004tgn5o5cpspqdglrl3ckgjr3u8nbf.apps.googleusercontent.com">
                <div className='divcenter' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                />
                </div>
                </GoogleOAuthProvider>
            </div>
        </div>
    </div>
        </>
    );
}
export default login;