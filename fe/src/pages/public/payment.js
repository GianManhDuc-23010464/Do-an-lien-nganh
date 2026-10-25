import {getMethod,getMethodPostByToken,getMethodByToken, postMethodPayload, uploadMultipleFile, deleteMethod} from '../../services/request'
import {formatMoney} from '../../services/money'
import { useState, useEffect } from 'react'
import { Parser } from "html-to-react";
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import Swal from 'sweetalert2'
import Select from 'react-select';


async function createInvoice() {
    var list = JSON.parse(localStorage.getItem("product_cart"));
    var uls = new URL(document.URL)
    var orderId = uls.searchParams.get("orderId");
    var requestId = uls.searchParams.get("requestId");
    var vnpOrderInfo = uls.searchParams.get("vnp_OrderInfo");
    var note = window.localStorage.getItem("ghichudonhang");
    var listSize = [];
    for (var i = 0; i < list.length; i++) {
        var obj = {
            "idProductSize": list[i].size.id,
            "quantity": list[i].quantity
        }
        listSize.push(obj);
    }
    var paytype = window.localStorage.getItem("paytype")
    var type = "PAYMENT_MOMO";
    var urlVnpay = null
    if(paytype == "VNPAY"){
        type = "PAYMENT_VNPAY"
        const currentUrl = window.location.href;
        const parsedUrl = new URL(currentUrl);
        const queryStringWithoutQuestionMark = parsedUrl.search.substring(1);
        urlVnpay = queryStringWithoutQuestionMark
    }
    var orderDto = {
        "payType": type,
        "userAddressId": window.localStorage.getItem("sodiachi"),
        "voucherCode": window.localStorage.getItem("voucherCode"),
        "note": note,
        "requestIdMomo": requestId,
        "orderIdMomo": orderId,
        "vnpOrderInfo": vnpOrderInfo,
        "urlVnpay": urlVnpay,
        "listProductSize": listSize
    }
    console.log(orderDto)
    const res = await postMethodPayload('/api/invoice/user/create', orderDto)
    var result = await res.json();
    if (res.status < 300) {
        document.getElementById("thanhcong").style.display = 'block'
    }
    if (res.status == 417) {
        document.getElementById("thatbai").style.display = 'block'
        document.getElementById("thanhcong").style.display = 'none'
        document.getElementById("errormess").innerHTML = result.defaultMessage
    }
}


function PublicPayment(){
    useEffect(()=>{
        createInvoice();
    }, []);

    return(
    <div class="content contentlogin">
        <div style={{marginTop:'180px'}}>
            <div id="thanhcong">
                <h3>Đặt hàng thành công</h3>
                <p >Cảm ơn bạn đã mua sản phẩm của chúng tôi.</p>
                <p>Hãy kiểm tra thông tin đặt hàng của bạn trong lịch sử đặt hàng</p>
                <a href="account#invoice" class="btn btn-danger">Xem lịch sử đặt hàng</a>
            </div>

            <div id="thatbai">
                <h3>Thông báo</h3>
                <p id="errormess">Bạn chưa hoàn thành thanh toán.</p>
                <p>Quay về <a href="index" style={{color:'red'}}>trang chủ</a></p>
            </div>
        </div>
    </div>
    );
}

export default PublicPayment;
