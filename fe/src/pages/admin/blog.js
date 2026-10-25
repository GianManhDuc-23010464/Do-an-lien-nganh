import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,postMethodPayload, deleteMethod} from '../../services/request';
import {formatMoney} from '../../services/money';


var size = 10
var url = '';
const AdminBlog = ()=>{
    const [items, setItems] = useState([]);
    const [pageCount, setpageCount] = useState(0);
    useEffect(()=>{
        getBlog();
    }, []);

    const getBlog = async() =>{
        var response = await getMethod('/api/blog/public/findAll?&size='+size+'&sort=id,desc&page='+0)
        var result = await response.json();
        setItems(result.content)
        setpageCount(result.totalPages)
        url = '/api/blog/public/findAll?&size='+size+'&sort=id,desc&page='
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
        var response = await deleteMethod('/api/blog/admin/delete?id='+id)
        if (response.status < 300) {
            toast.success("xóa thành công!");
            getBlog();
        }
        if (response.status == 417) {
            var result = await response.json()
            toast.warning(result.defaultMessage);
        }
    }

    return (
        <>
        <div class="headerpageadmin d-flex justify-content-between align-items-center p-3 bg-light border">
                <strong class="text-left"><i className='fa fa-users'></i> Quản Lý Bài Viết</strong>
                <div class="search-wrapper d-flex align-items-center">
                    <a href='add-blog' class="btn btn-primary ms-2"><i className='fa fa-plus'></i></a>
                </div>
            </div>
            <div class="tablediv">
                <div class="headertable">
                    <span class="lbtable">Danh sách bài viết</span>
                </div>
                <div class="divcontenttable">
                    <table id="example" class="table table-bordered">
                        <thead>
                            <tr>
                                <th>id bài viết</th>
                                <th>Ảnh bìa</th>
                                <th>ngày tạo</th>
                                <th>tiêu đề bài viết</th>
                                <th>mô tả</th>
                                <th class="sticky-col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item=>{
                                return  <tr>
                                    <td>{item.id}</td>
                                    <td><img src={item.imageBanner} className='imgtable'/></td>
                                    <td>{item.createdDate}</td>
                                    <td>{item.title}</td>
                                    <td>{item.description}</td>
                                    <td class="sticky-col">
                                        <a href={'add-blog?id='+item.id} class="edit-btn"><i className='fa fa-edit'></i></a>
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

export default AdminBlog;