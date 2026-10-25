import {getMethod,getMethodPostByToken,getMethodByToken, postMethodPayload, uploadMultipleFile, deleteMethod} from '../../services/request'
import {formatMoney} from '../../services/money'
import { useState, useEffect } from 'react'
import { Parser } from "html-to-react";
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';

var size = 5
var url = '';
function Cart(){
const [cart, setCart] = useState([]);
const [sanPham, setSanPham] = useState([]);
const [soLuongSp, setSoLuongSp] = useState(0);
const [tongTien, setTongTien] = useState(0);

useEffect(()=>{
    loadAllCart();
}, []);


async function loadAllCart() {
    var listcart = localStorage.getItem("product_cart");
    if (listcart == null) {
        return;
    }
    var list = JSON.parse(localStorage.getItem("product_cart"));
    setCart(list)
    var soLuongSp = 0;
    var tongTien = 0;
    for(var i=0; i< list.length; i++){
        soLuongSp += Number(list[i].quantity)
        tongTien += list[i].quantity * list[i].product.price
    }
    setSoLuongSp(soLuongSp)
    setTongTien(tongTien)
    productLqCart();
}

async function productLqCart() {
    var listcart = localStorage.getItem("product_cart");
    if (listcart == null) {
        return;
    }
    var list = JSON.parse(localStorage.getItem("product_cart"));
    var listCategory = [];
    for (var i = 0; i < list.length; i++) {
        var listcate = list[i].product.productCategories;
        for (var j = 0; j < listcate.length; j++) {
            listCategory.push(listcate[j].category.id);
        }
    }
    console.log(listCategory);
    
    const res = await postMethodPayload('/api/product/public/searchFull?page=0&size=4', listCategory)
    var resultLq = await res.json();
    var list = resultLq.content
    setSanPham(list)
}

async function remove(id) {
    var list = JSON.parse(localStorage.getItem("product_cart"));
    var remainingArr = list.filter(data => data.color.id != id);
    window.localStorage.setItem('product_cart', JSON.stringify(remainingArr));
    toast.success("Xóa sản phẩm thành công");
    loadAllCart();
}

return(
    <div class="content contentcart">
    <div class="bannerhot1">

    </div>
    <div class="row cartbds">
        <div class="col-lg-8 col-md-12 col-sm-12 col-12 collistcart">
            <div class="listcart">
                <span class="cartname">GIỎ HÀNG</span>
                <span class="slcarts">(<span id="slcart">{soLuongSp}</span>) Sản phẩm</span>

                <div class="cartres">
                    <table class="table tablecart">
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th>Tổng tiền</th>
                        </tr>
                        <tbody id="listcartDes">
                        {cart.map((item=>{
                            return <tr>
                                <td>
                                    <a href={"detail?id="+item.product.id}><img class="imgprocart" src={item.product.imageBanner}/></a>
                                    <div class="divnamecart">
                                        <a href={"detail?id="+item.product.id} class="nameprocart">{item.product.name}</a>
                                        <p class="sizecart">{item.color.colorName} / {item.size.sizeName}</p>
                                    </div>
                                </td>
                                <td>
                                    <p class="boldcart">{formatMoney(item.product.price)}</p>
                                </td>
                                <td>
                                    <div class="clusinp"><button class="cartbtn"> + </button>
                                        <input value={item.quantity} class="inputslcart"/>
                                        <button class="cartbtn"> - </button></div>
                                </td>
                                <td>
                                    <div class="tdpricecart">
                                        <p class="boldcart">{formatMoney(item.product.price * item.quantity)}</p>
                                        <p onClick={()=>remove(item.color.id)} class="delcart"><i class="fa fa-trash-o facartde"></i></p>
                                    </div>
                                </td>
                            </tr>
                            }))}
                        </tbody>
                    </table>


                </div>
            </div>
        </div>
        <div class="col-lg-4 col-md-12 col-sm-12 col-12 collistcart">
            <div class="ttcart">
                <div class="tongdon">
                    <span class="tds">Tổng đơn: </span><span class="tonggiatien" id="tonggiatien">{formatMoney(tongTien)}</span>
                    <button onClick={()=>window.location.href = 'checkout'} class="btnthanhtoan">Thanh toán</button>
                </div>
                <p class="freeship">MIỄN PHÍ VẬN CHUYỂN VỚI MỌI ĐƠN HÀNG</p>
                <p>Mọi đơn hàng trên hệ thống sẽ được miễn phí vận chuyển</p>
            </div>
        </div>
        <div class="col-lg-8 col-md-8 col-sm-12 col-12 colgoiycart">
            <div class="cartgoiy">
                <p class="tieudegy">Gợi ý sản phẩm</p>
                <div class="row" id="listproductgycart">
                {sanPham.map((item=>{
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
            </div>
        </div>
    </div>
</div>
);
}
export default Cart;