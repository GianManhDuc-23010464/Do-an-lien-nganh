import {getMethod,getMethodPostByToken,getMethodByToken, postMethodPayload, uploadMultipleFile, deleteMethod} from '../../services/request'
import {formatMoney} from '../../services/money'
import { useState, useEffect } from 'react'
import { Parser } from "html-to-react";
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

var size = 2
var url = '';
function Product(){
    const [product, setProduct] = useState([]);
    const [category, setCategory] = useState([]);
    const [outcategory, setOutCategory] = useState([]);
    const [pageCount, setpageCount] = useState(0);
    const [payload, setPayLoad] = useState({});
    const [price, setPrice] = useState([300000, 50000000]); 
    const [sort, setSort] = useState("id,desc"); 


    useEffect(()=>{
        const getCate = async() =>{
            var response = await getMethod('/api/category/public/findAllList');
            var result = await response.json();
            setCategory(result)
            var response = await getMethod('/api/category/public/findPrimaryCategory');
            var result = await response.json();
            setOutCategory(result)
        };getCate();
        getByDanhMuc();
    }, []);

    const handleChange = (event, newValue) => {
        setPrice(newValue);
    };

    function clickOpenSubMenu(event) {
        const e = event.currentTarget;
        var sing = e.parentNode.parentNode
        console.log(sing)
        if (sing.getElementsByClassName("listsubcate")[0].classList.contains("show") == false) {
            sing.getElementsByClassName("listsubcate")[0].classList.add("show");
        } else if (sing.getElementsByClassName("listsubcate")[0].classList.contains("show") == true) {
            sing.getElementsByClassName("listsubcate")[0].classList.remove("show");
            var listInput = sing.getElementsByClassName("listsubcate")[0].getElementsByClassName("inputcheck");
            for (var i = 0; i < listInput.length; i++) {
                listInput[i].checked = false;
            }
        }
    }

    
async function getByDanhMuc() {
    var uls = new URL(document.URL)
    var category = uls.searchParams.get("category");
    var pay = []
    pay.push(category)
    setPayLoad(pay)
    var urls = '/api/product/public/searchFull?size='+size+'&sort='+sort+'&page='+0;
    url = '/api/product/public/searchFull?size='+size+'&sort='+sort+'&page='
    const response = await postMethodPayload(urls,pay)
    var result = await response.json();
    setProduct(result.content)
    setpageCount(result.totalPages)
}

async function searchFull() {
    var listCa = document.getElementById("listsearchCategory").getElementsByClassName("inputcheck");
    var listcate = [];
    for (var i = 0; i < listCa.length; i++) {
        if (listCa[i].checked == true) {
            listcate.push(listCa[i].value);
        }
    }
    setPayLoad(listcate)
    var urls = '/api/product/public/searchFull?size='+size+'&sort='+sort+'&smallPrice='+price[0]+'&largePrice='+price[1]+'&page='+0;
    url = '/api/product/public/searchFull?size='+size+'&sort='+sort+'&smallPrice='+price[0]+'&largePrice='+price[1]+'&page='
    const response = await postMethodPayload(urls,listcate)
    var result = await response.json();
    setProduct(result.content)
    setpageCount(result.totalPages)
}

function getSort(){
    var sortpro = document.getElementById("sortpro").value
    setSort(sortpro)
}

const handlePageClick = async (data)=>{
    var currentPage = data.selected
    var response = await postMethodPayload(url+currentPage, payload)
    var result = await response.json();
    setProduct(result.content)
    setpageCount(result.totalPages)
}

    return(
        <>
       <div class="content">
        <div class="bannerhot1">

        </div>
        <h2 class="title-block">DANH MỤC NỔI BẬT</h2>
        <div id="listdmproduct" class="row listdmproduct">
        {outcategory.map((item=>{
             return <div class="col-lg-3 col-md-3 col-sm-6 col-6">
                <a href={"product?category="+item.id}>
                    <div class="singledmpro">
                        <img src={item.imageBanner} class="imgcatepro"/>
                        <span class="namedmpro">{item.name}</span>
                    </div>
                </a>
            </div> 
        }))}
        </div>
        <div class="row">
            <div class="col-lg-3 col-md-3"></div>
            <div class="col-lg-9 col-md-9 filterdiv">
                <span class="slsanpham">Có <span id="slsp">3</span> sản phẩm được tìm thấy</span>
                <span data-bs-toggle="modal" data-bs-target="#modalfilter" class="filtersp"><i class="fa fa-filter"></i> Bộ lọc</span>
                <select onChange={getSort} id="sortpro" class="form-control">
                    <option value="id,asc">Mới nhất</option>
                    <option value="price,asc">Rẻ nhất</option>
                    <option value="price,desc">Giá giảm dần</option>
                </select>
            </div>
            <div class="col-lg-3 col-md-3 col-filter">
                <div class="filter">
                    <label class="lb-chon-danhmuc">Chọn khoảng giá</label>
                    <button onClick={searchFull} class="btn-apdung">Áp dụng</button>
                    <div>
                        <Slider
                            value={price}
                            onChange={handleChange}
                            valueLabelDisplay="auto"
                            min={300000}
                            max={50000000}
                        />
                        <Typography>Khoảng giá: {formatMoney(price[0])} - {formatMoney(price[1])}</Typography>
                    </div><br/>
                    <label class="lb-chon-danhmuc">Chọn danh mục</label>
                    <div id="listsearchCategory">
                        {outcategory.map((item=>{
                            return <div class="singlelistmenu">
                            <label class="checkbox-custom cateparent">{item.name}
                                <input value={item.id} class="inputcheck" onChange={clickOpenSubMenu} type="checkbox"/>
                                <span class="checkmark-checkbox"></span>
                            </label>
                            <div class="listsubcate">
                                {item.categories.map((child=>{
                                    return <label class="checkbox-custom">{child.name}
                                    <input value={child.id} class="inputcheck" type="checkbox"/>
                                    <span class="checkmark-checkbox"></span>
                                </label>
                                }))}
                            </div>
                        </div>
                        }))}
                    </div>
                </div>
            </div>
            <div class="col-lg-9 col-md-9">
                <div class="row" id="listproductpro">
                    {product.map((item=>{
                    return <div class="col-lg-3 col-md-3 col-sm-6 col-6">
                        <a href={"detail?id="+item.id} class="linkpro">
                            <div class="singlepro">
                                <div class="productsold"><span class="reviewsp">Đã bán: {item.quantitySold}</span></div>
                                <img src={item.imageBanner} class="imgpro"/>
                                <span class="proname">{item.name}</span>
                                <span class="proprice">{formatMoney(item.price)}</span>
                                <div class="listimgpro">
                                {item.productImages.map((image=>{
                                    return <div class="divimgsmpro"><img class="imgsmpro" src={image.linkImage}/></div>
                                }))}
                                </div>
                            </div>
                        </a>
                    </div>
                    }))}
                </div>
                <br/><br/>
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
    </div>
        </>
    );
}
export default Product;