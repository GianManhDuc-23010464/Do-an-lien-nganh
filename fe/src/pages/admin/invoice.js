import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,postMethodPayload, deleteMethod, postMethod} from '../../services/request';
import {formatMoney} from '../../services/money';


var size = 10
var url = '';
const AdminInvoice = ()=>{
    const [items, setItems] = useState([]);
    const [trangthai, setTrangThai] = useState([]);
    const [pageCount, setpageCount] = useState(0);
    const [selectDonHang, setSelectDonHang] = useState(null);
    const [chiTietDonHang, setChiTietDonHang] = useState([]);
    const [donHang, setDonHang] = useState(null);
    const [idTrangThai, setIdTrangThai] = useState(-1);


    useEffect(()=>{
        getData();
        getTrangThai();
    }, []);

    const getTrangThai = async() =>{
        var response = await getMethod('/api/status/admin/all')
        var result = await response.json();
        setTrangThai(result)
    };

    const getData = async() =>{
        var start = document.getElementById("start").value
        var end = document.getElementById("end").value
        var type = document.getElementById("type").value
        var trangthai = document.getElementById("trangthai").value
        url = '/api/invoice/admin/find-all?size=' + size;
        if (start != "" && end != "") {
            url += '&from=' + start + '&to=' + end;
        }
        if (type != -1) {
            url += '&paytype=' + type;
        }
        if (trangthai != -1) {
            url += '&status=' + trangthai
        }
        url += '&page='
        var response = await getMethod(url+0)
        var result = await response.json();
        console.log(result);
        
        setItems(result.content)
        setpageCount(result.totalPages)
    };

    const handlePageClick = async (data)=>{
        var currentPage = data.selected
        var response = await getMethod(url+currentPage)
        var result = await response.json();
        setItems(result.content)
        setpageCount(result.totalPages)
    }
    
    async function getChiTietDon(invoice) {
        setSelectDonHang(invoice)
        var response = await getMethod('/api/invoice-detail/admin/find-by-invoice?idInvoice='+invoice.id);
        var result = await response.json();
        setChiTietDonHang(result)
    }

    function getTrangThaiUp(item){
        setDonHang(item)
        setIdTrangThai(item.status.id)
    }

    async function updateStatus() {
        var idtrangthai = document.getElementById("trangthaiupdate").value
        var idinvoice = document.getElementById("iddonhangupdate").value
        var url = 'http://localhost:8080/api/invoice/admin/update-status?idInvoice=' + idinvoice + '&idStatus=' + idtrangthai;
        const res = await postMethod(url)
        if (res.status < 300) {
            toast.success("Cập nhật trạng thái đơn hàng thành công!");
            getData();
        }
        if (res.status == 417) {
            var result = await res.json()
            toast.warning(result.defaultMessage);
        }
    }

    return (
        <>
        <div class="headerpageadmin d-flex justify-content-between align-items-center p-3 bg-light border">
                <strong class="text-left"><i className='fa fa-users'></i> Quản Lý Đơn Hàng</strong>
                <div class="search-wrapper d-flex align-items-center">
                    <div className='d-flex divngayadmin'>
                        <input type='date' id='start' className='selectheader'/> 
                        <input type='date' id='end' className='selectheader'/>  
                        <select id="type" class="selectheader">
                            <option value="-1">--- Loại thanh toán---</option>
                            <option value="PAYMENT_MOMO">Thanh toán bằng momo</option>
                            <option value="PAYMENT_DELIVERY">Thanh toán khi nhận hàng</option>
                            <option value="PAYMENT_VNPAY">Thanh toán vnpay</option>
                        </select>
                        <select id="trangthai" class="selectheader">
                            <option value="-1">--- Trạng thái---</option>
                            {trangthai.map((item=>{
                                return <option value={item.id}>{item.name}</option>
                            }))}
                        </select>

                        <button className='btn btn-primary selectheader'>Lọc</button>
                    </div>
                </div>
            </div>
            <div class="tablediv">
                <div class="headertable">
                    <span class="lbtable">Danh sách đơn hàng</span>
                </div>
                <div class="divcontenttable">
                    <table id="example" class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Mã đơn hàng</th>
                                <th class="floatr">Ngày đặt</th>
                                <th>Địa chỉ</th>
                                <th class="floatr">Giá trị<br/>đơn hàng</th>
                                <th>Trạng thái thanh toán</th>
                                <th class="floatr">Trạng thái vận chuyển</th>
                                <th class="sticky-col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item=>{
                                return  <tr>
                                    <td>{item.id}</td>
                                    <td>{item.createdTime}<br/>{item.createdDate}</td>
                                    <td>{item.address}</td>
                                    <td>{formatMoney(item.totalAmount)}</td>
                                    <td>{item.status.name}</td>
                                    <td>{item.payType != 'PAYMENT_DELIVERY'?<span class="dathanhtoan">Đã thanh toán</span>:<span class="chuathanhtoan">Thanh toán khi nhận hàng(COD)</span>}</td>
                                    <td class="sticky-col">
                                        <i onClick={()=>getChiTietDon(item)} data-bs-toggle="modal" data-bs-target="#modaldeail" class="fa fa-eye iconaction"></i>
                                        <i onClick={()=>getTrangThaiUp(item)} data-bs-toggle="modal" data-bs-target="#capnhatdonhang" class="fa fa-edit iconaction"></i><br/>
                                    </td>
                                </tr>
                            }))}
                        </tbody>
                    </table>

                    <ReactPaginate 
                        marginPagesDisplayed={2} 
                        pageCount={pageCount} 
                        onPageChange={handlePageClick}
                        containerClassName={'pagination'} 
                        pageClassName={'page-item'} 
                        pageLinkClassName={'page-link'}
                        previousClassName='page-item'
                        previousLinkClassName='page-link'
                        nextClassName='page-item'
                        nextLinkClassName='page-link'
                        breakClassName='page-item'
                        breakLinkClassName='page-link' 
                        previousLabel='Trang trước'
                        nextLabel='Trang sau'
                        activeClassName='active'/>
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
            
            <div class="modal fade" id="capnhatdonhang" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Cập nhật trạng thái đơn hàng</h5> <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
                        <div class="modal-body">
                            <input value={donHang?.id} type="hidden" id="iddonhangupdate"/>
                            <select class="form-control" id="trangthaiupdate">
                                {trangthai.map((item=>{
                                    return <option selected={idTrangThai == item.id} value={item.id}>{item.name}</option>
                                }))}
                            </select><br/><br/>
                            <button onClick={()=>updateStatus()} class="btn btn-primary form-control action-btn">Cập nhật</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default AdminInvoice;