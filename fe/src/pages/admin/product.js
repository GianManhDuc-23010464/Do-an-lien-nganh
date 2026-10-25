import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,postMethodPayload, deleteMethod} from '../../services/request';
import {formatMoney} from '../../services/money';
import Select from 'react-select';


var size = 10
var url = '';
const AdminProduct = ()=>{
    const [items, setItems] = useState([]);
    const [category, setcategory] = useState([]);
    const [selectCategory, setSelectcategory] = useState([]);
    const [pageCount, setpageCount] = useState(0);
    const [payloadCate, setpayloadCate] = useState([]);

    useEffect(()=>{
        getCategory();
        getProduct();
    }, []);

    const getCategory = async() =>{
        var response = await getMethod('/api/category/public/findAllList')
        var result = await response.json();
        setcategory(result)
    };

    const getProduct = async() =>{
        var listcate = [];
        for(var i=0; i< selectCategory.length; i++){
            listcate.push(selectCategory[i].id)
        }
        setpayloadCate(listcate)
        var response = await postMethodPayload('/api/product/public/searchFull?&size='+size+'&page='+0, listcate)
        var result = await response.json();
        setItems(result.content)
        setpageCount(result.totalPages)
        url = '/api/product/public/searchFull?&size='+size+'&page='
    };

    const handlePageClick = async (data)=>{
        var currentPage = data.selected
        var response = await postMethodPayload(url+currentPage, payloadCate)
        var result = await response.json();
        setItems(result.content)
        setpageCount(result.totalPages)
    }
    

    async function deleteData(id){
        var con = window.confirm("Bạn chắc chắn muốn xóa dữ liệu này?");
        if (con == false) {
            return;
        }
        var response = await deleteMethod('/api/product/admin/delete?id='+id)
        if (response.status < 300) {
            toast.success("xóa thành công!");
            getProduct();
        }
        if (response.status == 417) {
            var result = await response.json()
            toast.warning(result.defaultMessage);
        }
    }

    return (
        <>
        <div class="headerpageadmin d-flex justify-content-between align-items-center p-3 bg-light border">
                <strong class="text-left"><i className='fa fa-users'></i> Quản Lý Sản Phẩm</strong>
                <div class="search-wrapper d-flex align-items-center">
                    <div className='d-flex divngayadmin'>
                        <Select
                            isMulti
                            options={category}
                            value={selectCategory}
                            onChange={setSelectcategory}
                            getOptionLabel={(option) => option.name} 
                            getOptionValue={(option) => option.id}    
                            placeholder="Chọn danh mục"
                        /> 
                        <button onClick={()=>getProduct()} className='btn btn-primary selectheader'>Lọc</button>
                        <a href='add-product' class="btn btn-primary ms-2"><i className='fa fa-plus'></i></a>
                    </div>
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
                                <th>id</th>
                                <th>Ảnh</th>
                                <th>Mã</th>
                                <th>Danh mục</th>
                                <th>Tên</th>
                                <th>Giá</th>
                                <th>Ngày tạo</th>
                                <th>Số lượng bán</th>
                                <th class="sticky-col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item=>{
                                return  <tr>
                                    <td>{item.id}</td>
                                    <td><img src={item.imageBanner} className='imgtable'/></td>
                                    <td>{item.code}</td>
                                    <td>
                                    {item.productCategories.map((dm=>{
                                        return <a href="" class="tagcauhoi">{dm.category.name}</a>
                                    }))}
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{formatMoney(item.price)}</td>
                                    <td>{item.createdDate}</td>
                                    <td>{item.quantitySold}</td>
                                    <td class="sticky-col">
                                        <a href={'add-product?id='+item.id} class="edit-btn"><i className='fa fa-edit'></i></a>
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

export default AdminProduct;