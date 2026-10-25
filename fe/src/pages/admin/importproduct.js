import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,postMethodPayload, deleteMethod} from '../../services/request';
import {formatMoney} from '../../services/money';


var size = 10
var url = '';
const AdminImport = ()=>{
    const [items, setItems] = useState([]);
    const [pageCount, setpageCount] = useState(0);
    useEffect(()=>{
        getData("","");
    }, []);

    const getData = async(start, end) =>{
        var urls = '/api/import-product/admin/findByProductAndDate?&size='+size+'&sort=id,desc&page='
        if(start != "" && end != ""){
            urls = '/api/import-product/admin/findByProductAndDate?&size='+size+'&sort=id,desc&from='+start+'&to='+end+'&page='
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
        var response = await deleteMethod('/api/import-product/admin/delete?id='+id)
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
                <strong class="text-left"><i className='fa fa-users'></i> Quản Lý Nhập hàng</strong>
                <div class="search-wrapper d-flex align-items-center">
                <div className='d-flex divngayadmin'>
                        <input type='date' id='start' className='selectheader'/> 
                        <input type='date' id='end' className='selectheader'/>  
                        <button onClick={()=>searchData()} className='btn btn-primary selectheader'>Lọc</button>
                        <a href='add-importproduct' class="btn btn-primary ms-2"><i className='fa fa-plus'></i></a>
                    </div>
                </div>
            </div>
            <div class="tablediv">
                <div class="headertable">
                    <span class="lbtable">Danh sách nhập hàng</span>
                </div>
                <div class="divcontenttable">
                    <table id="example" class="table table-bordered">
                        <thead>
                            <tr>
                                <th>id đơn nhập</th>
                                <th>sản phẩm</th>
                                <th>Số lượng nhập</th>
                                <th>giá nhập</th>
                                <th>Ngày nhập</th>
                                <th>Thông tin</th>
                                <th class="sticky-col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item=>{
                                return  <tr>
                                    <td>{item.id}</td>
                                    <td>{
                                           <>
                                            Sản phẩm: <span class="bold">{item.productName}</span><br/>
                                            Sản phẩm: <span class="bold">{item.colorName}</span><br/>
                                            Size: {item.productSize.sizeName}
                                           </> 
                                        }
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td>{formatMoney(item.importPrice)}</td>
                                    <td>{item.importTime}<br/> {item.importDate}</td>
                                    <td dangerouslySetInnerHTML={{__html:item.description}}></td>
                                    <td class="sticky-col">
                                        {/* <a href={'add-importproduct?id='+item.id} class="edit-btn"><i className='fa fa-edit'></i></a> */}
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

export default AdminImport;