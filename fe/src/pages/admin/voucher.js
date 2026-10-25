import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,postMethodPayload, deleteMethod} from '../../services/request';
import {formatMoney} from '../../services/money';


var size = 10
var url = '';
const AdminVoucher = ()=>{
    const [items, setItems] = useState([]);
    const [pageCount, setpageCount] = useState(0);
    useEffect(()=>{
        getData("","");
    }, []);

    const getData = async(start, end) =>{
        var urls = '/api/voucher/admin/findAll-page?&size='+size+'&sort=id,desc&page='
        if(start != "" && end != ""){
            urls = '/api/voucher/admin/findAll-page?&size='+size+'&sort=id,desc&start='+start+'&end='+end+'&page='
        }
        var response = await getMethod(urls+0)
        var result = await response.json();
        setItems(result.content)
        setpageCount(result.totalPages)
        url = urls;
    };

    const handlePageClick = async (data)=>{
        var currentPage = data.selected
        var response = await getMethod(url+currentPage)
        var result = await response.json();
        setItems(result.content)
        setpageCount(result.totalPages)
    }
    

    async function deleteData(id){
        var con = window.confirm("Bạn chắc chắn muốn xóa dữ liệu này?");
        if (con == false) {
            return;
        }
        var response = await deleteMethod('/api/voucher/admin/delete?id='+id)
        if (response.status < 300) {
            toast.success("xóa thành công!");
            getData("","");
        }
        if (response.status == 417) {
            var result = await response.json()
            toast.warning(result.defaultMessage);
        }
    }

    function searchData(){
        getData(document.getElementById("start").value, document.getElementById("end").value);
    }

    return (
        <>
        <div class="headerpageadmin d-flex justify-content-between align-items-center p-3 bg-light border">
                <strong class="text-left"><i className='fa fa-users'></i> Quản Lý Khuyến Mại</strong>
                <div class="search-wrapper d-flex align-items-center">
                <div className='d-flex divngayadmin'>
                        <input type='date' id='start' className='selectheader'/> 
                        <input type='date' id='end' className='selectheader'/>  
                        <button onClick={()=>searchData()} className='btn btn-primary selectheader'>Lọc</button>
                        <a href='add-voucher' class="btn btn-primary ms-2"><i className='fa fa-plus'></i></a>
                    </div>
                </div>
            </div>
            <div class="tablediv">
                <div class="headertable">
                    <span class="lbtable">Danh sách khuyến mại</span>
                </div>
                <div class="divcontenttable">
                    <table id="example" class="table table-bordered">
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Mã</th>
                                <th>Tên voucher</th>
                                <th>Đơn hàng tối thiểu</th>
                                <th>Giảm giá</th>
                                <th>Ngày bắt đầu</th>
                                <th>Ngày kết thúc</th>
                                <th>Trạng thái</th>
                                <th class="sticky-col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item=>{
                                return  <tr>
                                    <td>{item.id}</td>
                                    <td>{item.code}</td>
                                    <td>{item.name}</td>
                                    <td>{formatMoney(item.minAmount)}</td>
                                    <td>{formatMoney(item.discount)}</td>
                                    <td>{item.startDate}</td>
                                    <td>{item.endDate}</td>
                                    <td>{item.block == true?<span class="locked">Đã khóa</span>:<span class="actived">Đang hoạt động</span>}</td>
                                    <td class="sticky-col">
                                        <a href={'add-voucher?id='+item.id} class="edit-btn"><i className='fa fa-edit'></i></a>
                                        <button onClick={()=>deleteData(item.id)} class="delete-btn"><i className='fa fa-trash'></i></button>
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
        </>
    );
}

export default AdminVoucher;