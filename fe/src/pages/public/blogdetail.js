import {getMethod,getMethodPostByToken,getMethodByToken, postMethodPayload, uploadMultipleFile, deleteMethod} from '../../services/request'
import {formatMoney} from '../../services/money'
import { useState, useEffect } from 'react'
import { Parser } from "html-to-react";
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';

var size = 5
var url = '';
function BlogDetail(){
    const [blog, setBlog] = useState(null);

    useEffect(()=>{
        const getBlog = async() =>{
            var uls = new URL(document.URL)
            var id = uls.searchParams.get("id");
            const response = await getMethod('/api/blog/public/findById?id=' + id);
            var result = await response.json();
            setBlog(result)
        };
        getBlog();
    }, []);

    return(
        <>
          <div class="content contentdetailblog">
            <div class="contentdtbg">
                <p class="titledtblog" id="title">TOP 10 shop giày da nam Hà Nội uy tín, chất lượng nhất</p>
                <div class="userblog">
                    <img src={blog?.imageBanner} style={{width:'100%'}}/>
                    <span class="">Biên tập bởi : <span id="userbldt">{blog?.user.fullname}</span></span>
                    <span class="timedtblog"><i class="fa fa-clock"></i> <span id="ngaydang">{blog?.createdDate}</span></span>
                </div>
                <img id="imgbanner" src="image/blog.webp" alt="" class="imgbldt"/><br/> <br/>
                <span class="desdetailblog"></span>

                <div id="contentdetailblog" dangerouslySetInnerHTML={{__html:blog?.content}}>

                </div>
            </div>
        </div>
        </>
    );
}
export default BlogDetail;