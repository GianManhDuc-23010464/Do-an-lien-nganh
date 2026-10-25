import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,postMethodPayload, deleteMethod, uploadSingleFile} from '../../services/request';
import {formatMoney} from '../../services/money';
import { Editor } from '@tinymce/tinymce-react';
import React, { useRef } from 'react';




async function saveVoucher() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var code = document.getElementById("code").value
    var namevoucher = document.getElementById("namevoucher").value
    var minamount = document.getElementById("minamount").value
    var discount = document.getElementById("discount").value
    var from = document.getElementById("from").value
    var to = document.getElementById("to").value
    var lockvoucher = document.getElementById("lockvoucher").checked

    var url = 'http://localhost:8080/api/voucher/admin/create';
    if (id != null) {
        url = 'http://localhost:8080/api/voucher/admin/update';
    }
    var voucher = {
        "id": id,
        "code": code,
        "name": namevoucher,
        "discount": discount,
        "minAmount": minamount,
        "startDate": from,
        "endDate": to,
        "block": lockvoucher
    }
    const response = await postMethodPayload(url,voucher)
    if (response.status < 300) {
        Swal.fire({
            title: "Thông báo",
            text: "Thành công!",
            preConfirm: () => {
                window.location.href = 'voucher'
            }
        });
    }
    if (response.status == 417) {
        var result = await response.json()
        toast.warning(result.defaultMessage);
    }
}


const AdminAddVoucher = ()=>{
    const [item, setItem] = useState(null);
    useEffect(()=>{
        const getData = async() =>{
            var uls = new URL(document.URL)
            var id = uls.searchParams.get("id");
            if(id != null){
                var response = await getMethod('/api/voucher/admin/findById?id='+id)
                var result = await response.json();
                setItem(result)
                document.getElementById("lockvoucher").checked = result.block
            }
        };
        getData();
    }, []);

    

    return (
        <>
         <div class="col-sm-12 header-sps">
            <div class="title-add-admin">
                <h4>Thêm/ cập nhật khuyến mại</h4>
            </div>
        </div>
        <div class="col-sm-12">
            <main class="main row">
            <div class="col-sm-5">
                    <label class="lb-form">Mã voucher</label>
                    <input id="code" type="text" class="form-control"/>
                    <label class="lb-form">Tên voucher</label>
                    <input id="namevoucher" type="text" class="form-control"/>
                    <label class="lb-form">Số tiền tối thiểu</label>
                    <input id="minamount" type="number" class="form-control"/>
                    <label class="lb-form">Giảm giá</label>
                    <input id="discount" type="number" class="form-control"/>
                </div>
                <div class="col-sm-5">
                    <label class="lb-form">Từ ngày</label>
                    <input id="from" type="date" class="form-control"/>
                    <label class="lb-form">Đến ngày</label>
                    <input id="to" type="date" class="form-control"/>
                    <label class="checkbox-custom">Khóa voucher 
                        <input id="lockvoucher" type="checkbox"/>
                        <span class="checkmark-checkbox"></span>
                    </label><br/>
                    <button onClick={()=>saveVoucher()} class="btn btn-primary form-control">Thêm/ Cập nhật voucher</button>
                </div>
            </main>
        </div>
        </>
    );
}

export default AdminAddVoucher;