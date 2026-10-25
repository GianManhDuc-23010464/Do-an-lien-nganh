import { useState, useEffect } from 'react'
import {getMethod} from '../../../services/request'
import React, { createContext, useContext } from 'react';

export const HeaderContext = createContext();


var token = localStorage.getItem("token");
function Header (){
    const [numCart, setNumCart] = useState(0);
    const [categories, setCategories] = useState([]);

    useEffect(()=>{
        loadCategoryMenu();
        loadCartMenu();
    }, []);
    import ('./header.scss');

    async function loadCategoryMenu() {
        const response = await getMethod('/api/category/public/findPrimaryCategory');
        var list = await response.json();
        setCategories(list);
    }
    
    async function loadCartMenu() {
        var listcart = localStorage.getItem("product_cart");
        if (listcart == null) {
            return;
        }
        var list = JSON.parse(localStorage.getItem("product_cart"));
        setNumCart(list.length);
    }
    
    
    

    function logout(){
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace('login')
    }

    var token = localStorage.getItem('token');
    var authen =  <a href="login" class="pointermenu gvs"><i class="fa fa-user"> Đăng ký/ Đăng nhập</i></a>
    if(token != null){
        authen = <>
        <span class="nav-item dropdown pointermenu gvs">
            <i class="fa fa-user nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"> Tài khoản</i>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><a class="dropdown-item" href="account">Tài khoản</a></li>
                <li onClick={logout}><a class="dropdown-item" href="#">Đăng xuất</a></li>
            </ul>
        </span>
        </>
    }
    if(token == null){
        if(document.getElementById("btnchatbottom")){
            document.getElementById("btnchatbottom").style.display = 'none'
        }
    }
    return(
        <div id="menusss">
            <nav class="navbar navbar-expand-lg">
                <div class="container-fluid">
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <a class="navbar-brand navbar-toggler" href="index"><img className='logoheader70' src="image/logo.png"/></a>
                    <span>
                        <i data-bs-toggle="modal" data-bs-target="#modalsearch" class="fa fa-search navbar-toggler"></i>
                        <i class="fa fa-shopping-bag navbar-toggler"> <span id="slcartmenusm" class="slcartmenusm">{numCart}</span></i>
                    </span>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0" id='mainmenut'>
                        <li class="nav-item"><a class="" href="index"><img className='img140' src="image/logo.png"/></a></li>
                        <li class="nav-item"><a class="nav-link menulink" href="about">Về chúng tôi</a></li>
                        <li class="nav-item"><a class="nav-link menulink" href="blog">Blog</a></li>
                        {categories.map((item, index)=>{
                            return <li class="nav-item dropdown ddtog">
                                <a class="nav-link menulink ddtog" href="#" id="cate1" role="button" data-bs-toggle="dropdown" aria-expanded="false">{item.name}</a>
                                <ul class="dropdown-menu" aria-labelledby="cate1">
                                {item.categories.map((child, indexChild)=>{
                                    return <li><a class="dropdown-item" href={"product?category="+child.id}>{child.name}</a></li>
                                })}
                                </ul>
                            </li>
                        })}
                    </ul>
                    <div class="d-flex">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#modalsearch" class="pointermenu gvs"><i class="fa fa-search"></i></a>
                        {authen}
                        <a href="cart" class="pointermenu"><i class="fa fa-shopping-bag"><span class="slcartmenu" id="slcartmenu">{numCart}</span> Giỏ hàng</i></a>
                    </div>
                </div>
                </div>
            </nav>
        </div>
    );

    
}

export default Header;