import {getMethod,getMethodPostByToken,getMethodByToken, postMethodPayload, uploadMultipleFile, deleteMethod} from '../../services/request'
import {formatMoney} from '../../services/money'
import { useState, useEffect } from 'react'
import { Parser } from "html-to-react";
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";


var size = 5
var token = window.localStorage.getItem("token")
function Detail(){
    const [product, setProduct] = useState(null);
    const [itemProduct, setItemProduct] = useState([]);
    const [itemSize, setItemSize] = useState([]);
    const [comments, setComments] = useState([]);
    const [selectSize, setselectSize] = useState(null);
    const [selectColor, setselectColor] = useState(null);
    const [selectIndexColor, setselectIndexColor] = useState(0);
    const [selectIndexSize, setselectIndexSize] = useState(-1);
    const [imgchinh, setImgChinh] = useState("");

    var star = 5;
    useEffect(()=>{
        var uls = new URL(document.URL)
        var id = uls.searchParams.get("id");
        const getProduct = async() =>{
            const response = await getMethod('/api/product/public/findById?id=' + id);
            var result = await response.json();
            setProduct(result)
            setImgChinh(result.imageBanner)
            setselectColor(result.productColors[0])
            setItemSize(result.productColors[0].productSizes)
        };
        getProduct();
        getComment();
  }, []);
  const getComment = async() =>{
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    const response = await getMethod('/api/product-comment/public/find-by-product?idproduct=' + id);
    var result = await response.json();
    setComments(result)
};

  async function loadSize(color, index) {
    setselectIndexColor(index);
    setselectColor(color)
    setselectSize(null)
    setselectIndexSize(-1)
    const response = await getMethod('/api/product-size/public/find-by-product-color?idProColor=' + color.id);
    var result = await response.json();
    setItemSize(result)
  }

  function setSizeSelect(size, index){
    setselectSize(size)
    setselectIndexSize(index)
  }

    function upAndDownDetail(val) {
        var quan = document.getElementById("inputslcart").value;
        if (val < 0 && quan == 1) {
            return;
        }
        document.getElementById("inputslcart").value = Number(quan) + Number(val)
    }

    var check = 1;
    function readmore() {
        if (check % 2 != 0) {
            document.getElementById("descriptiondetail").style.height = 'auto'
        } else {
            document.getElementById("descriptiondetail").style.height = '200px'
        }
        check++;
    }

    function setFile() {
        var lis = document.getElementById("choosefilecmt").files.length;
        if (lis > 3) {
            document.getElementById("errorquan").style.display = 'block'
            document.getElementById("slfile").innerHTML = ''
        }
        if (lis > 0 && lis < 4) {
            document.getElementById("errorquan").style.display = 'none'
            document.getElementById("slfile").innerHTML = 'Bạn đã chọn ' + lis + ' ảnh'
        }
    }

    function loadStar(val) {
        star = val + 1;
        var listS = document.getElementById("liststar").getElementsByClassName("fa-star");
        for (var i = 0; i < listS.length; i++) {
            listS[i].classList.remove('checkedstar');
        }
        for (var i = 0; i < listS.length; i++) {
            if (i <= val) {
                listS[i].classList.add('checkedstar');
            }
        }
    
    }


    async function addCart(type) {
        var sizeId = selectSize.id;
        if(selectSize == null){
            toast.error("Bạn chưa chọn kích thước sản phẩm")
            return;
        }
        var obj = {
            "product": product,
            "color": selectColor,
            "size": selectSize,
            "quantity": document.getElementById("inputslcart").value
        }
        if (localStorage.getItem("product_cart") == null) {
            var listproduct = [];
            listproduct.push(obj);
            window.localStorage.setItem('product_cart', JSON.stringify(listproduct));
            if(type != null && type != undefined) window.location.href = 'cart'
            return;
        } else {
            var list = JSON.parse(localStorage.getItem("product_cart"));
            console.log(list)
            for (var i = 0; i < list.length; i++) {
                if (Number(list[i].size.id) == Number(sizeId)) {
                    toast.success("Thêm giỏ hàng thành công");
                    if(type != null && type != undefined) window.location.href = 'cart'
                    return;
                }
            }
            list.push(obj);
            window.localStorage.setItem('product_cart', JSON.stringify(list));
            toast.success("Thêm giỏ hàng thành công");
            if(type != null && type != undefined) window.location.href = 'cart'
        }
    }

    
async function saveComment() {
    // document.getElementById("loading").style.display = 'block'
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var noidungbl = document.getElementById("noidungbl").value
    if (document.getElementById("choosefilecmt").files.length > 3) {
        toast.error("Chỉ được chọn tối đa 3 ảnh");
        return;
    }
    var listLinkImg = await uploadMultipleFile(document.getElementById("choosefilecmt"));
    var comment = {
        "star": star,
        "content": noidungbl,
        "listLink": listLinkImg,
        "product": {
            "id": id
        }
    }
    const response = await postMethodPayload('/api/product-comment/user/create', comment)
    if (response.status < 300) {
        toast.success("Thành công!")
        getComment();
        document.getElementById("noidungbl").value = "";
    } else {
        toast.error("Thất bại!");
    }
}

async function deleteComment(id) {
    var con = window.confirm("Bạn muốn xóa bình luận này?");
    if (con == false) {
        return;
    }
    const response = await deleteMethod('/api/product-comment/user/delete?id=' + id)
    if (response.status < 300) {
        toast.success("xóa thành công!");
        getComment();
    }
    if (response.status == 417) {
        var result = await response.json()
        toast.warning(result.defaultMessage);
    }
}



    return(
    <>
    <div class="content">
        <div class="row contentdetailproduct">
            <div class="col-lg-3 col-md-5 col-sm-12 col-12">
                <img id="imgdetailpro" src={imgchinh} class="imgdetailpro"/>
                <div class="listimgdetail row" id="listimgdetail">
                {product?.productImages.map((item=>{
                    return <div class="col-lg-2 col-md-2 col-sm-2 col-2 singdimg">
                        <img onClick={()=>setImgChinh(item.linkImage)} src={item.linkImage} class="imgldetail"/>
                    </div>
                }))}
                </div>
            </div>
            <div class="col-lg-4 col-md-7 col-sm-12 col-12">
                <span class="detailnamepro" id="detailnamepro">{product?.name}</span>
                <div class="blockdetailpro">
                    <span class="codepro" id="codepro">{product?.code}</span>
                    <span class="quansale" id="quansale">Đã bán {product?.quantitySold}</span>
                </div>
                <p class="pricedetail" id="pricedetail">{formatMoney(product?.price)}</p>
                <span class="colordetail">Màu sắc: <span class="colorname" id="colorname">{selectColor?.colorName}</span></span>
                <div class="listimgdetail row" id="listimgColor">
                {product?.productColors.map((item, index)=>{
                    return <div class="col-lg-2 col-md-2 col-sm-2 col-2 singdimg">
                        <img onClick={()=>loadSize(item, index)} src={item.linkImage} class={index==selectIndexColor?"imgldetail imgactive":"imgldetail"}/>
                    </div>
                })}
                </div>
                <span class="colordetail">Kích thước</span>
                <div class="listsize row" id="listsize">
                    {itemSize.map((item, index)=>{
                        if(item.quantity > 0){
                            return <div class="colsize col-lg-2 col-md-2 col-sm-2 col-2">
                            <label onClick={()=>setSizeSelect(item, index)} class={index == selectIndexSize?"radio-custom activesize":"radio-custom"} for={"size"+item.id}>{item.sizeName}
                                <input value={item.id} type="radio" name="sizepro" id={"size"+item.id}/>
                            </label>
                        </div> 
                        }
                        else{
                            return <div class="colsize col-lg-2 col-md-2 col-sm-2 col-2">
                            <label class="radio-custom disablesize" for="size${list[i].id}">{item.sizeName}
                            </label></div>
                        }
                    })}
                </div>
                <span data-bs-toggle="modal" data-bs-target="#modalsize" class="choosesize"><img src="image/size.svg"/><span> Giúp bạn chọn size</span></span>
                <div class="addcartdetail">
                    <button onClick={()=>upAndDownDetail(-1)} class="cartbtn"> - </button>
                    <input id="inputslcart" class="inputslcart" value="1"/>
                    <button onClick={()=>upAndDownDetail(1)} class="cartbtn"> + </button></div>
                <div class="btndetail">
                    <button onClick={()=>addCart(null)} id="btnaddcart" class="btnaddcart"><i class="fa fa-shopping-cart"></i> Thêm giỏ hàng</button>
                    <button onClick={()=>addCart(1)}class="btnmuangay">Mua ngay</button>
                </div>
            </div>
            <div class="col-lg-5 col-md-12 col-sm-12 col-12">
                <div class="row">
                    <div class="col-lg-6 col-md-6 col-sm-6 col-6 align-items-center">
                        <div class="d-flex flex-column align-items-center">
                            <img src="image/free.svg"/>
                        </div>
                        <div class="titledetail">Miễn phí vận chuyển<br/>với mọi đơn hàng từ 498k</div>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-6 col-6 align-items-center">
                        <div class="d-flex flex-column align-items-center">
                            <img src="image/freedt.svg"/>
                        </div>
                        <div class="titledetail">Miễn phí đổi trả tại 230+ cửa hàng trong 15 ngày</div>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-6 col-6 align-items-center">
                        <div class="d-flex flex-column align-items-center">
                            <img src="image/pay.svg"/>
                        </div>
                        <div class="titledetail">Đa dạng phương thức thanh toán<br/>(Momo, COD)</div>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-6 col-6 align-items-center">
                        <div class="d-flex flex-column align-items-center">
                            <img src="image/vc.svg"/>
                        </div>
                        <div class="titledetail">Vận chuyển siêu tốc <br/>từ 1 đến 3 ngày</div>
                    </div>
                </div>
            </div>
            <div class="col-lg-12 motasp">
                <p class="titledes">Mô tả sản phẩm</p>
                <div id="descriptiondetail" dangerouslySetInnerHTML={{__html:product?.description}}></div>
                <span onClick={readmore} class="readmore">Đọc thêm mô tả</span>
            </div>
            <div class="col-lg-7 col-md-8 col-sm-12 col-12">
                <p class="titledes">Phản hổi</p>
                <div class="listcautlct" id="listcautlct">
                {comments.map((item, index)=>{
                    var star = '';
                    for (var j = 0; j < item.star; j++) {
                        star += `<span class="fa fa-star checkedstar"></span>`
                    }
                    return <div class="singlectlct">
                    <div class="row">
                        <div class="col-11">
                            <div class="d-flex nguoidangctl">
                                <img class="avtuserdangctl" src="image/avatar.webp"/>
                                <span class="usernamedangctl">{item.user.fullname}</span>
                                <span class="ngaytraloi">{item.createdDate}</span>
                                <span class="starcmts" dangerouslySetInnerHTML={{__html:star}}></span>
                                {item.isMyComment==true?<span class="starcmts"><i onClick={()=>deleteComment(item.id)} class="fa fa-trash pointer"></i></span>:''}
                            </div>
                            <div class="contentctlct">{item.content}</div>
                            <div class="listimgcontent">
                            {item.productCommentImages.map((image, index)=>{
                                return <img class="imgcomment" src={image.linkImage}/>
                            })}
                            </div>
                        </div>
                    </div>
                </div>
                })}
                </div>
                {token && (
                <div class="col-sm-12 col-12" id="mycomment">
                    <div class="liststar" id="liststar">
                        <span onClick={()=>loadStar(0)} class="fa fa-star checkedstar"></span>
                        <span onClick={()=>loadStar(1)} class="fa fa-star checkedstar"></span>
                        <span onClick={()=>loadStar(2)} class="fa fa-star checkedstar"></span>
                        <span onClick={()=>loadStar(3)} class="fa fa-star checkedstar"></span>
                        <span onClick={()=>loadStar(4)} class="fa fa-star checkedstar"></span>
                    </div>

                    <label id="titlerep" class="lb-chon-danhmuc">Bình luận của bạn</label>
                    <textarea id="noidungbl" class="form-control"></textarea>
                    <div onClick={()=>document.getElementById("choosefilecmt").click()} class="divchooseimg">
                        <img src="image/addimg.png"/>
                        <span id="slfile">Đính kèm hình ảnh (chọn tối đa 3 hình)</span>
                        <span id="errorquan">Chỉ được chọn tối đa 3 ảnh</span>
                        <input onChange={setFile} type="file" id="choosefilecmt" multiple/>
                    </div>
                    <button onClick={saveComment} class="btn btn-primary form-control">Binh luận</button>
                </div>
                 )}
            </div>
            <div class="col-lg-12 goiysp">
                <p class="titledes">Gợi ý sản phẩm</p>
                <div class="row" id="listProductGy">
                {itemProduct.map((item=>{
                    return <div class="col-lg-20p col-md-3 col-sm-6 col-6">
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
            </div>
        </div>
    </div>


    <div class="modal fade" id="modalsize" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-fullscreen-sm-down modeladdres">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Hướng dẫn chọn size</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <img src="image/huongdan.jpg" style={{width: '100%'}}/>
                </div>
            </div>
        </div>
    </div>
    </>
  );
}


export default Detail;
