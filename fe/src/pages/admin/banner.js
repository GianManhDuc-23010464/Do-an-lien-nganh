import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,uploadSingleFile, deleteMethod, postMethodPayload} from '../../services/request';
import {formatMoney} from '../../services/money';


var size = 10
var url = '';
var linkImage = ''
const AdminBanner = ()=>{
    const [items, setItems] = useState([]);
    const [banner, setBanner] = useState(null);
    const [pageCount, setpageCount] = useState(0);
    useEffect(()=>{
        getData();
    }, []);

    const getData = async() =>{
        var response = await getMethod('/api/banner/public/search?&size='+size+'&q=&page='+0)
        var result = await response.json();
        setItems(result.content)
        setpageCount(result.totalPages)
        url = '/api/banner/public/search?&size='+size+'&q=&page='
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
        var response = await deleteMethod('/api/banner/admin/delete?id='+id)
        if (response.status < 300) {
            toast.success("xóa thành công!");
            getData();
        }
        if (response.status == 417) {
            var result = await response.json()
            toast.warning(result.defaultMessage);
        }
    }

    function clearData(){
        setBanner(null)
        document.getElementById("idbanner").value = ""
        document.getElementById("tentrang").value = ""
        document.getElementById("idsanpham").value = ""
        document.getElementById("linkweb").value = ""
        document.getElementById("imgbannerpre").src = ""
        linkImage = ""
    }
    
    function getBanner(item){
        setBanner(item)
        linkImage = item.image
    }

    async function saveBanner() {
        document.getElementById("loading").style.display = 'block'
        var id = document.getElementById("idbanner").value
        var pageName = document.getElementById("tentrang").value
        var idProduct = document.getElementById("idsanpham").value
        var linkWeb = document.getElementById("linkweb").value
        var bannerType = document.getElementById("bannerType").value
    
        var linktam = await uploadSingleFile(document.getElementById('chonfileanh'))
        if(linktam != null) linkImage = linktam
        var url = '/api/banner/admin/create';
        if (id != "" && id != null) {
            url = '/api/banner/admin/update';
        }
        var payload = {
            "id": id,
            "pageName": pageName,
            "idProduct": idProduct,
            "linkWeb": linkWeb,
            "image": linkImage,
            "bannerType": bannerType,
        }
        const response = await postMethodPayload(url, payload)
        if (response.status < 300) {
            toast.success("thêm/sửa banner thành công!");
            getData();
            clearData();
            document.getElementById("loading").style.display = 'none'
        }
        else{
            var result = await response.json()
            toast.warning("Thất bại");
        }
        document.getElementById("loading").style.display = 'none'
    }
    

    return (
        <>
        <div class="headerpageadmin d-flex justify-content-between align-items-center p-3 bg-light border">
                <strong class="text-left"><i className='fa fa-users'></i> Quản Lý Banner</strong>
                <div class="search-wrapper d-flex align-items-center">
                    <a onClick={()=>clearData()} data-bs-toggle="modal" data-bs-target="#addtk" href='#' class="btn btn-primary ms-2"><i className='fa fa-plus'></i></a>
                </div>
            </div>
            <div class="tablediv">
                <div class="headertable">
                    <span class="lbtable">Danh sách banner</span>
                </div>
                <div class="divcontenttable">
                    <table id="example" class="table table-bordered">
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Ảnh</th>
                                <th>Loại banner</th>
                                <th>Tên trang</th>
                                <th>Link web</th>
                                <th>Id sản phẩm</th>
                                <th class="sticky-col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item=>{
                                return  <tr>
                                    <td>{item.id}</td>
                                    <td><img src={item.image} className='imgtable'/></td>
                                    <td>{item.bannerType}</td>
                                    <td>{item.pageName}</td>
                                    <td>{item.linkWeb}</td>
                                    <td>{item.idProduct}</td>
                                    <td class="sticky-col">
                                        <a onClick={()=>getBanner(item)} href='#' data-bs-toggle="modal" data-bs-target="#addtk" class="edit-btn"><i className='fa fa-edit'></i></a>
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

            <div class="modal fade" id="addtk" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="false">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Thêm cập nhật banner</h5> <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
            <div class="modal-body row">
                <div class="col-sm-6" style={{margin:'auto'}}>
                    <input defaultValue={banner?.id} id="idbanner" type="hidden" class="form-control"/>
                    <label class="lb-form">Tên trang</label>
                    <input defaultValue={banner?.pageName} id="tentrang" type="text" placeholder="xyz" class="form-control"/>
                    <label class="lb-form">Loại banner</label>
                    <select id="bannerType" class="form-control">
                        <option value="TOP">Banner top</option>
                        <option value="NORMAL">Banner thường</option>
                    </select>
                    <label class="lb-form">Id sản phẩm</label>
                    <input defaultValue={banner?.idProduct} id="idsanpham" type="text" class="form-control"/>
                    <label class="lb-form">Link web</label>
                    <input defaultValue={banner?.linkWeb} id="linkweb" type="text" placeholder="link website sau khi click" class="form-control"/>
                    <label class="lb-form">Ảnh banner</label>
                    <input id="chonfileanh" type="file" class="form-control"/>
                    <img src={banner?.image} id="imgbannerpre" className='imgadd'/>
                    <br/>
                    <div id="loading">
                        <div class="bar1 bar"></div>
                    </div><br/>
                    <button onClick={()=>saveBanner()} class="form-control btn btn-primary">Thêm/ cập nhật banner</button>
                </div>
            </div>
        </div>
    </div>
</div>
        </>
    );
}

export default AdminBanner;