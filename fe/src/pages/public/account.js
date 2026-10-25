import {getMethod,getMethodPostByToken,getMethodByToken, postMethodPayload, uploadMultipleFile, deleteMethod, postMethod} from '../../services/request'
import {formatMoney} from '../../services/money'
import { useState, useEffect } from 'react'
import { Parser } from "html-to-react";
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import Swal from 'sweetalert2'
import Select from 'react-select';

async function changePassword(event) {
    event.preventDefault();
    var newpass = document.getElementById("newpass").value
    var renewpass = document.getElementById("renewpass").value
    if (newpass != renewpass) {
        alert("mật khẩu mới không trùng khớp");
        return;
    }
    var passw = {
        "oldPass":  document.getElementById("oldpass").value,
        "newPass": newpass
    }
    const response = await postMethodPayload('/api/user/change-password', passw)
    if (response.status < 300) {
            Swal.fire({
                title: "Thông báo",
                text: "cập nhật mật khẩu thành công, hãy đăng nhập lại!",
                preConfirm: () => {
                    window.location.reload();
                }
            });
    }
    if (response.status == 417) {
        var result = await response.json()
        toast.warning(result.defaultMessage);
    }
}

function Account(){
const [diaChi, setDiaChi] = useState([]);
const [selectDiaChi, setSelectDiaChi] = useState(null);
const [donHang, setDonHang] = useState([]);
const [chiTietDonHang, setChiTietDonHang] = useState([]);
const [selectDonHang, setSelectDonHang] = useState(null);
const [tinh, setTinh] = useState([]);
const [selectTinh, setselectTinh] = useState(null);
const [huyen, setHuyen] = useState([]);
const [selectHuyen, setSelectHuyen] = useState(null);
const [xa, setXa] = useState([]);
const [selectXa, setSelectXa] = useState(null);


useEffect(()=>{
    loadInit();
    getInvoice();
    getDiaChi();
    getProvince();
}, []);

const getProvince = async() =>{
    var response = await getMethod('/api/address/public/province');
    var result = await response.json();
    setTinh(result)
};

const getHuyen = async(option) =>{
    setSelectHuyen(null)
    setSelectXa(null)
    setselectTinh(option)
    setHuyen(option.districts) 
};

const getXa = async(option) =>{
    setSelectXa(null)
    setSelectHuyen(option)
    setXa(option.wards) 
};

const getInvoice = async() =>{
    var response = await getMethod('/api/invoice/user/find-by-user');
    var result = await response.json();
    setDonHang(result)
};

const getDiaChi = async() =>{
    var response = await getMethod('/api/user-address/user/my-address');
    var result = await response.json();
    setDiaChi(result)
};

async function cancelInvoice(id) {
    var con = window.confirm("xác nhận hủy đơn hàng này");
    if(con == false){
        return;
    }
    const res = await postMethod('/api/invoice/user/cancel-invoice?idInvoice='+id)
    if(res.status < 300){
        toast.success("Hủy đơn hàng thành công!");
        getInvoice();
    }
    if (res.status == 417) {
        var result = await res.json()
        toast.warning(result.defaultMessage);
    }
}

async function getChiTietDon(invoice) {
    setSelectDonHang(invoice)
    var response = await getMethod('/api/invoice-detail/user/find-by-invoice?idInvoice='+invoice.id);
    var result = await response.json();
    setChiTietDonHang(result)
}

async function deleteAddressUser(id) {
    var con = window.confirm("Bạn chắc chắn muốn xóa địa chỉ này?");
    if (con == false) {
        return;
    }
    const response = await deleteMethod('/api/user-address/user/delete?id=' + id)
    if (response.status < 300) {
        toast.success("xóa địa chỉ thành công!");
        getDiaChi()
    }
    if (response.status == 417) {
        var result = await response.json()
        toast.warning(result.defaultMessage);
    }
}



async function addAddressUser() {
    if(selectXa == null){
        toast.error("Hãy chọn đầy đủ địa chỉ"); return;
    }
    var addu = {
        "id": document.getElementById("idadduser").value,
        "fullname": document.getElementById("fullnameadd").value,
        "phone": document.getElementById("phoneadd").value,
        "streetName": document.getElementById("stressadd").value,
        "primaryAddres": document.getElementById("primaryadd").checked,
        "wards": {
            id: selectXa.id
        }
    }
    var url = '/api/user-address/user/create';
    if (document.getElementById("idadduser").value != "") {
        url = '/api/user-address/user/update';
    }
    const response = await postMethodPayload(url,addu)
    if (response.status < 300) {
        toast.success("Thành công")
        getDiaChi();
    }
    if (response.status == 417) {
        var result = await response.json()
        toast.warning(result.defaultMessage);
    }
}

function clearDuLieu(){
    document.getElementById("idadduser").value = ""
    document.getElementById("fullnameadd").value = ""
    document.getElementById("phoneadd").value = ""
    document.getElementById("stressadd").value = ""
    document.getElementById("primaryadd").checked = false
    setSelectDiaChi(null)
    setselectTinh(null)
    setSelectHuyen(null)
    setSelectXa(null)
}

async function setDiaChiInit(item){
    document.getElementById("idadduser").value = item.id
    document.getElementById("fullnameadd").value = item.fullname
    document.getElementById("phoneadd").value = item.phone
    document.getElementById("stressadd").value = item.streetName
    document.getElementById("primaryadd").checked = item.primaryAddres
    setselectTinh(item.wards.districts.province)
    var listDis = [];
    for(var i=0; i< tinh.length; i++){
        if(tinh[i].id == item.wards.districts.province.id){
            listDis = tinh[i].districts
            getHuyen(tinh[i])
            setSelectHuyen(item.wards.districts)
            break;
        }
    }
    for(var i=0; i< listDis.length; i++){
        if(listDis[i].id == item.wards.districts.id){
            getXa(listDis[i])
            setSelectXa(item.wards)
            break;
        }
    }
}


return(
    <div class="content contentcart">
    <div class="row cartbds">
        <div class="col-lg-3 col-md-3 col-sm-12 col-12 collistcart">
            <div class="navleft">
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-6 col-6">
                        <div class="avaaccount">
                            <img src="image/avatar.webp" class="avataracc"/>
                            <button onclick="logout()" class="btnlogoutacc">Đăng xuất</button>
                        </div>
                    </div>
                    <div class="col-lg-12 col-md-12 col-sm-6 col-6 sinv">
                        <div onClick={(event) => changeLink(event, 'address')} class="tabdv activetabdv">
                            <a data-toggle="tab" href="#address"><img class="imgau" src="image/add.svg"/> Sổ địa chỉ</a>
                        </div>
                        <div onClick={(event) => changeLink(event, 'invoice')} class="tabdv">
                            <a data-toggle="tab" href="#invoice"><img class="imgau" src="image/invoice.svg"/> Đơn hàng của tôi</a>
                        </div>
                        <div onClick={(event) => changeLink(event, 'changepass')} class="tabdv">
                            <a data-toggle="tab" href="#changepass"><img class="imgau" src="image/pass.svg"/> Đổi mật khẩu</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-9 col-md-9 col-sm-12 col-12 collistcart">
            <div class="navright">
                <div class="tab-content contentab">
                    <div role="tabpanel" class="tab-pane" id="invoice">
                        <div class="headeraccount">
                            <p class="fontyel">Đơn hàng của tôi</p>
                            <span>(Nhấp vào mã đơn hàng để xem chi tiêt)</span>
                            <div class="right_flex">
                                <span class="textrf" id="sldonhang">0 đơn hàng</span>
                            </div>
                        </div>
                        <table class="table table-cart table-order" id="my-orders-table">
                            <thead class="thead-default">
                                <tr>
                                    <th>Mã đơn hàng</th>
                                    <th class="floatr">Ngày mua</th>
                                    <th>Địa chỉ</th>
                                    <th class="floatr">Giá trị<br/>đơn hàng</th>
                                    <th>Trạng thái thanh toán</th>
                                    <th class="floatr">Trạng thái vận chuyển</th>
                                    <th>Hủy</th>
                                </tr>
                            </thead>
                            <tbody id="listinvoice">
                            {donHang.map((item=>{
                                return <tr>
                                    <td onClick={()=>getChiTietDon(item)}><a data-bs-toggle="modal" data-bs-target="#modaldeail" class="yls pointer-event">#{item.id}</a></td>
                                    <td class="floatr">{item.createdTime} {item.createdDate}</td>
                                    <td>{item.address}</td>
                                    <td class="floatr"><span class="yls">{formatMoney(item.totalAmount)}</span></td>
                                    <td>
                                    {item.payType != 'PAYMENT_DELIVERY'?<span class="dathanhtoan">Đã thanh toán</span>:<span class="chuathanhtoan">Chưa thanh toán</span>}
                                    </td>
                                    <td class="floatr"><span class="span_">{item.status.name}</span></td>
                                    <td>
                                    {(item.status.id == 1 || item.status.id== 2) && item.payType == 'PAYMENT_DELIVERY'?
                                    <i onClick={()=>cancelInvoice(item.id)} class="fa fa-trash-o huydon"></i>:''}
                                    </td>
                                </tr>
                            }))}
                            </tbody>
                        </table>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="changepass">
                        <div class="headeraccount">
                            <span class="fontyel">Đổi mật khẩu</span><span class="smyl"> (Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác)</span>
                        </div>
                        <div class="col-lg-6 col-md-6 col-sm-12 col-12 passacc">
                            <form onSubmit={changePassword}>
                                <label class="lbacc">Mật khẩu hiện tại *</label>
                                <input id="oldpass" type="password" class="form-control"/>
                                <label class="lbacc">Mật khẩu mới *</label>
                                <input id="newpass" type="password" class="form-control"/>
                                <label class="lbacc">Xác nhận mật khẩu mới *</label>
                                <input id="renewpass" type="password" class="form-control"/>
                                <br/><button type="button" class="btnhuylogin" onclick="window.location.href='account'">HỦY</button>
                                <button type="submit" class="btntt">LƯU</button>
                            </form>
                        </div>
                    </div>
                    <div role="tabpanel" class="tab-pane active" id="address">
                        <div class="headeraccount">
                            <p class="fontyel">Địa chỉ của bạn</p>
                            <div class="right_flex">
                                <button onClick={clearDuLieu} data-bs-toggle="modal" data-bs-target="#modaladd" class="btnsuathongtin">+ Thêm địa chỉ mới</button>
                            </div>
                        </div>
                        <div class="contentacc" id="listaddacc">
                        {diaChi.map((item=>{
                            return <div class="row singleadd">
                                <div class="col-lg-11 col-md-11 col-sm-12 col-12">
                                    <table class="table tableadd">
                                        <tr>
                                            <td class="tdleft">Họ tên:</td>
                                            <td class="tdright">{item.fullname}
                                                <span class="addressdef">{item.primaryAddres == true ?<span><i class="fa fa-check-circle"></i> Địa chỉ mặc định</span>:''}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="tdleft">Địa chỉ:</td>
                                            <td class="tdright">{item.streetName}, {item.wards.name}, {item.wards.districts.name},<br/> {item.wards.districts.province.name}</td>
                                        </tr>
                                        <tr>
                                            <td class="tdleft">Số điện thoại:</td>
                                            <td class="tdright">{item.phone}</td>
                                        </tr>
                                        <tr>
                                            <td class="tdleft">Ngày tạo:</td>
                                            <td class="tdright">{item.createdDate}</td>
                                        </tr>
                                    </table>
                                </div>
                                <div class="col-lg-1 col-md-1 col-sm-12 col-12">
                                    <span onClick={()=>setDiaChiInit(item)} data-bs-toggle="modal" data-bs-target="#modaladd" class="actionacc acsua">Sửa</span>
                                    <span onClick={()=>deleteAddressUser(item.id)} class="actionacc acdel">Xóa</span>
                                </div>
                            </div>
                        }))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>


    <div class="modal fade" id="modaladd" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-fullscreen-sm-down modeladdres">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Thêm địa chỉ mới</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <input type="hidden" id="idadduser"/>
                        <div class="col-lg-6 col-md-6 col-sm-12 col-12 formadd">
                            <input id="fullnameadd" class="form-control fomd" placeholder="Họ tên"/>
                        </div>
                        <div class="col-lg-6 col-md-6 col-sm-12 col-12 formadd">
                            <input id="phoneadd" class="form-control fomd" placeholder="Số điện thoại"/>
                        </div>
                        <div class="col-lg-12 col-md-12 col-sm-12 col-12 formadd">
                            <input id="stressadd" class="form-control fomd" placeholder="Tên đường, số nhà"/>
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12 col-12 formadd">
                            <Select
                                options={tinh}
                                value={selectTinh}
                                onChange={getHuyen}
                                getOptionLabel={(option) => option.name} 
                                getOptionValue={(option) => option.id}    
                                closeMenuOnSelect={false}
                                name='tinh'
                                placeholder="Chọn tỉnh thành"
                            />
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12 col-12 formadd">
                            <Select
                                options={huyen}
                                value={selectHuyen}
                                onChange={getXa}
                                getOptionLabel={(option) => option.name} 
                                getOptionValue={(option) => option.id}    
                                closeMenuOnSelect={false}
                                name='huyen'
                                placeholder="Chọn quận/ huyện"
                            />
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12 col-12 formadd">
                            <Select
                                options={xa}
                                value={selectXa}
                                onChange={setSelectXa}
                                getOptionLabel={(option) => option.name} 
                                getOptionValue={(option) => option.id}    
                                closeMenuOnSelect={false}
                                name='xa'
                                placeholder="Chọn phường/ xã"
                            />
                        </div>
                    </div>
                    <br/><label class="checkbox-custom">Đặt làm địa chỉ mặc định
                    <input id="primaryadd" type="checkbox"/>
                    <span class="checkmark-checkbox"></span>
                </label>
                    <div class="col-lg-6 col-md-6">
                        <br/><button class="btnhuylogin" onclick="window.location.href='account'">HỦY</button>
                        <button onClick={()=>addAddressUser()} class="btntt">LƯU</button>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div class="modal fade" id="modaldeail" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-fullscreen-sm-down modeladdres">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Chi tiết đơn hàng</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row headerdetail">
                        <div class="col-lg-4 col-md-4 col-sm-12 col-12">
                            <br/><span>Ngày tạo: <span class="yls" id="ngaytaoinvoice">{selectDonHang?.createdTime} {selectDonHang?.createdDate}</span></span>
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12 col-12">
                            <br/><span>Trạng thái thanh toán: <span class="yls" id="trangthaitt">{selectDonHang?.payType!="PAYMENT_DELIVERY"?"Đã thanh toán":"Thanh toán khi nhận hàng"}</span></span>
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12 col-12">
                            <br/><span>Trạng thái vận chuyển: <span class="yls" id="ttvanchuyen">{selectDonHang?.status.name}</span></span>
                        </div>
                    </div>
                    <div class="row shipinfor">
                        <div class="col-lg-6 col-md-6 col-sm-12 col-12">
                            <span class="ttshipinfor">Địa chỉ giao hàng</span>
                            <div class="blockinfor">
                                <p class="tennguoinhan" id="tennguoinhan">{selectDonHang?.receiverName}</p>
                                <span>Địa chỉ: <span id="addnhan">{selectDonHang?.address}</span></span>
                                <br/><span class="phoneacc">Số điện thoại: <span id="phonenhan">{selectDonHang?.phone}</span></span>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-12 col-12">
                            <span class="ttshipinfor">Thanh toán</span>
                            <div class="blockinfor">
                                <span id="loaithanhtoan">{selectDonHang?.payType}</span>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-12 col-12">
                            <span class="ttshipinfor">Ghi chú</span>
                            <div class="blockinfor">
                                <span id="ghichunh">{selectDonHang?.note}</span>
                            </div>
                        </div>
                    </div><br/><br/>
                    <table class="table table-cart table-order" id="detailInvoice">
                        <thead class="thead-default theaddetail">
                            <tr>
                                <th>Sản phẩm</th>
                                <th></th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th>Tổng</th>
                            </tr>
                        </thead>
                        <tbody id="listDetailinvoice">
                        {chiTietDonHang.map((item=>{
                            return <tr>
                                <td><img src={item.product.imageBanner} class="imgdetailacc"/></td>
                                <td>
                                    <a href="">{item.productName}</a><br/>
                                    <span>{item.colorName} / {item.productSize.sizeName}</span><br/>
                                    <span>Mã sản phẩm: {item.product.code}</span><br/>
                                    <span class="slmobile">SL: {item.quantity}</span>
                                </td>
                                <td>{formatMoney(item.price)}</td>
                                <td class="sldetailacc">{item.quantity}</td>
                                <td class="pricedetailacc yls">{formatMoney(item.quantity * item.price)}</td>
                            </tr>
                        }))}
                        </tbody>
                    </table><br/><br/><br/><br/>
                </div>
            </div>
        </div>
    </div>
</div>
);

function changeLink(event, link) {
    const e = event.currentTarget;
    var tabs = document.getElementsByClassName("tabdv");
    for (var i = 0; i < tabs.length; i++) {
        document.getElementsByClassName("tabdv")[i].classList.remove("activetabdv");
    }
    e.classList.add('activetabdv')

    var tabb = document.getElementsByClassName("tab-pane");
    for (var i = 0; i < tabb.length; i++) {
        document.getElementsByClassName("tab-pane")[i].classList.remove("active");
    }
    document.getElementById(link).classList.add('active')
}

function loadInit(){
    var hash = window.location.hash.substr(1);
    if (hash != "") {
        var tabb = document.getElementsByClassName("tab-pane");
        for (var i = 0; i < tabb.length; i++) {
            document.getElementsByClassName("tab-pane")[i].classList.remove("active");
        }
        var tabs = document.getElementsByClassName("tabdv");
        for (var i = 0; i < tabs.length; i++) {
            document.getElementsByClassName("tabdv")[i].classList.remove("activetabdv");
        }
        document.getElementById(hash).classList.add('active')
    }
}
}
export default Account;