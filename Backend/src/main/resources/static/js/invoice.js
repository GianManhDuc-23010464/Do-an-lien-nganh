async function loadMyInvoice() {
    var url = 'http://localhost:8080/api/invoice/user/find-by-user';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await response.json();
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<tr>
                    <td onclick="loadDetailInvoice(${list[i].id})" data-bs-toggle="modal" data-bs-target="#modaldeail"><a class="yls pointer-event">#${list[i].id}</a></td>
                    <td class="floatr">${list[i].createdTime}<br>${list[i].createdDate}</td>
                    <td>${list[i].address}</td>
                    <td class="floatr"><span class="yls">${formatmoney(list[i].totalAmount)}</span></td>
                    <td><span class="span_pending">${list[i].payType == 'PAYMENT_MOMO'?'<span class="dathanhtoan">Đã thanh toán</span>':'<span class="chuathanhtoan">Chưa thanh toán</span>'}</span></td>
                    <td class="floatr"><span class="span_">${list[i].status.name}</span></td>
                    <td>
                    ${(list[i].status.id == 1 || list[i].status.id== 2) && list[i].payType == 'PAYMENT_DELIVERY'?
                    `<i onclick="cancelInvoice(${list[i].id})" class="fa fa-trash-o huydon"></i>`:''}
                    </td>
                </tr>`
    }
    document.getElementById("listinvoice").innerHTML = main
    document.getElementById("sldonhang").innerHTML = list.length+' đơn hàng'

    var mobile = ''
    for (i = 0; i < list.length; i++) {
        mobile += `<tr class="trmobile">
        <td style="width: 40%;">Đơn hàng</td>
        <td  class="position-relative">
            <a onclick="loadDetailInvoice(${list[i].id})" data-bs-toggle="modal" data-bs-target="#modaldeail" class="yls iddhmb pointer-event">#${list[i].id}</a>
            ${(list[i].status.id == 1 || list[i].status.id== 2) && list[i].payType == 'PAYMENT_DELIVERY'?
            `<span onclick="cancelInvoice(${list[i].id})" class="huymobile">Hủy đơn</span>`:''}
        </td>
    </tr>
    <tr>
        <td>Ngày: </td>
        <td>${list[i].createdTime} ${list[i].createdDate}</td>
    </tr>
    <tr>
        <td>Địa chỉ: </td>
        <td>${list[i].address}</td>
    </tr>
    <tr>
        <td>Giá trị đơn hàng:</td>
        <td class="yls">${formatmoney(list[i].totalAmount)}</td>
    </tr>
    <tr>
        <td>TT Thanh toán:</td>
        <td>${list[i].payType == 'PAYMENT_MOMO'?'<span class="dathanhtoan">Đã thanh toán</span>':'<span class="chuathanhtoan">Thanh toán khi nhận hàng(COD)</span>'}</td>
    </tr>
    <tr>
        <td>TT Vận chuyển:<br><br></td>
        <td>${list[i].status.name}</td>
    </tr>`
    }
    document.getElementById("listinvoicemb").innerHTML = mobile
}

async function loadDetailInvoice(id) {
    var url = 'http://localhost:8080/api/invoice-detail/user/find-by-invoice?idInvoice='+id;
    const res = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await res.json();
    var main = ''
    for(i=0; i< list.length; i++){
        main += `<tr>
                    <td><img src="${list[i].product.imageBanner}" class="imgdetailacc"></td>
                    <td>
                        <a href="">${list[i].productName}</a><br>
                        <span>${list[i].colorName} / ${list[i].productSize.sizeName}</span><br>
                        <span>Mã sản phẩm: ${list[i].product.code}</span><br>
                        <span class="slmobile">SL: ${list[i].quantity}</span>
                    </td>
                    <td>${formatmoney(list[i].price)}</td>
                    <td class="sldetailacc">${list[i].quantity}</td>
                    <td class="pricedetailacc yls">${formatmoney(list[i].price * list[i].quantity)}</td>
                </tr>`
    }
    document.getElementById("listDetailinvoice").innerHTML = main

    var url = 'http://localhost:8080/api/invoice/user/find-by-id?idInvoice='+id;
    const resp = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await resp.json();
    document.getElementById("ngaytaoinvoice").innerHTML = result.createdTime+" " + result.createdDate 
    document.getElementById("trangthaitt").innerHTML = result.payType=="PAYMENT_MOMO"?"Đã thanh toán":"Thanh toán khi nhận hàng"
    document.getElementById("loaithanhtoan").innerHTML = result.payType=="PAYMENT_MOMO"?"Thanh toán qua momo":"Thanh toán khi nhận hàng (COD)"
    document.getElementById("ttvanchuyen").innerHTML = result.status.name
    document.getElementById("tennguoinhan").innerHTML = result.receiverName
    document.getElementById("addnhan").innerHTML = result.address
    document.getElementById("addnhan").innerHTML = result.address
    document.getElementById("phonenhan").innerHTML = result.phone
    document.getElementById("phonenhan").innerHTML = result.phone
    document.getElementById("ghichunh").innerHTML = result.note=="" ||result.note==null?'Không có ghi chú':result.note
}

async function cancelInvoice(id) {
    var con = confirm("xác nhận hủy đơn hàng này");
    if(con == false){
        return;
    }
    var url = 'http://localhost:8080/api/invoice/user/cancel-invoice?idInvoice='+id;
    const res = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if(res.status < 300){
        toastr.success("Hủy đơn hàng thành công!");
        loadMyInvoice();
    }
    if (res.status == exceptionCode) {
        var result = await res.json()
        toastr.warning(result.defaultMessage);
    }
}