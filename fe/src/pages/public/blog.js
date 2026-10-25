import {getMethod,getMethodPostByToken,getMethodByToken, postMethodPayload, uploadMultipleFile, deleteMethod} from '../../services/request'
import {formatMoney} from '../../services/money'
import { useState, useEffect } from 'react'
import { Parser } from "html-to-react";
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';

var size = 5
var url = '';
function Blog(){
    const [itemBlog, setItemBlog] = useState([]);
    const [primaryBlog, setprimaryBlog] = useState(null);
    const [pageCount, setpageCount] = useState(0);

    useEffect(()=>{
        const getBlog = async() =>{
            var response = await getMethod('/api/blog/public/findPrimaryBlog');
            var result = await response.json();
            setprimaryBlog(result)

            var response = await getMethod('/api/blog/public/findAll?size='+size+'&page=0');
            var result = await response.json();
            setItemBlog(result.content)
            setpageCount(result.totalPages)
            url = '/api/product/public/findAll?size='+size+'&page='
        };
        getBlog();
    }, []);

    const handlePageClick = async (data)=>{
        var currentPage = data.selected
        var response = await getMethod(url+currentPage)
        var result = await response.json();
        setItemBlog(result.content)
        setpageCount(result.totalPages)
      }

    return(
        <>
         <div class="content">
        <div class="bannerblog">
            <img id="bannerimgblog" src={primaryBlog?.imageBanner} class="bannerimgblog"/>
            <div class="contentbanner">
                <p class="htkn">Hành trình kết nối</p>
                <a href={"blogdetail?id="+primaryBlog?.id} id="hfef">
                    <p class="htkny" id="titlebloghea">{primaryBlog?.title}</p>
                </a>
                <p id="desblogpri">{primaryBlog?.description}</p>
                <p><span><i class="fa fa-clock"></i> <span id="ngaydangb">{primaryBlog?.createdDate}</span></span>
                </p>
                <button id="btndocngay" onClick={()=>window.location.href="blogdetail?id="+primaryBlog?.id} class="btndathang text-white">Đọc ngay</button>
            </div>
        </div>
        <div id="listblog" class="row">
            {itemBlog.map((item=>{
                return <div class="col-lg-4 col-md-6 col-sm-12 col-12 singleblog">
                <div class="row">
                    <div class="col-5">
                        <a href={"blogdetail?id="+item.id}><img src={item.imageBanner} class="imgblog"/></a>
                    </div>
                    <div class="col-7 cntblog">
                        <a href={"blogdetail?id="+item.id} class="titleblog">{item.title}</a>
                        <a href={"blogdetail?id="+item.id}><span class="desblog">{item.description}</span></a>
                        <div class="userblog">
                            <img src="image/avtyo.webp" class="avtyo"/>
                            <span class="userdbg">{item.user.fullname}</span>
                            <span class="timeblog"><i class="fa fa-clock"></i> {item.createdDate}</span>
                        </div>
                    </div>
                </div>
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
        </>
    );
}
export default Blog;