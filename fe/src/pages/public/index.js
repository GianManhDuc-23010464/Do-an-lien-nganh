import Footer from '../../layout/user/footer/footer'
import banner from '../../assest/images/banner.jpg'
import banner1 from '../../assest/images/banner1.png'
import banner2 from '../../assest/images/banner2.jpg'
import {getMethod,getMethodPostByToken,getMethodByToken} from '../../services/request'
import {formatMoney} from '../../services/money'
import {loadBanner} from '../../services/banner'
import { useState, useEffect } from 'react'
import { Parser } from "html-to-react";
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";


var size = 5
var url = '';
var urlbanchay = '';
function Home(){
    const [itemCategories, setItemCategories] = useState([]);
    const [itemProduct, setItemProduct] = useState([]);
    const [itemProductBanChay, setItemProductBanChay] = useState([]);
    const [itemBlog, setItemBlog] = useState([]);
    const [primaryBlog, setprimaryBlog] = useState(null);
    const [pageCount, setpageCount] = useState(0);
    const [pageCountBanChay, setpageCountBanChay] = useState(0);
    const settings = {
      dots: true, 
      infinite: true, 
      speed: 500, // Tốc độ chuyển đổi
      slidesToShow: 8, // Số slide hiển thị
      slidesToScroll: 1, // Số slide cuộn mỗi lần
      autoplay: true, // Tự động chạy carousel
      autoplaySpeed: 2000, // Tốc độ tự chạy
      responsive: [
        {
          breakpoint: 600, // Với màn hình nhỏ hơn 600px
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 1000, 
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
          },
        },
      ],
    };

    useEffect(()=>{
      const getCate = async() =>{
          const response = await getMethod('/api/category/public/findAllList');
          var result = await response.json();
          setItemCategories(result)
      };getCate();
      const getBlog = async() =>{
          var response = await getMethod('/api/blog/public/findAll?page=0&size=9&sort=id,desc');
          var result = await response.json();
          setItemBlog(result.content)
          var response = await getMethod('/api/blog/public/findPrimaryBlog');
          var result = await response.json();
          setprimaryBlog(result)
      };getBlog();
      const getProduct = async() =>{
          const response = await getMethod('/api/product/public/findAll?size='+size+'&page=0');
          var result = await response.json();
          setItemProduct(result.content)
          setpageCount(result.totalPages)
          url = '/api/product/public/findAll?size='+size+'&page='
      };
      getProduct();
      const getProductBanChay = async() =>{
          const response = await getMethod('/api/product/public/findAll?size='+size+'&sort=quantitySold,desc&page=0');
          var result = await response.json();
          setItemProductBanChay(result.content)
          setpageCountBanChay(result.totalPages)
          urlbanchay = '/api/product/public/findAll?size='+size+'&sort=quantitySold,desc&page='
      };
      getProductBanChay();
      loadBanner();
  }, []);
  
  const handlePageClick = async (data)=>{
    var currentPage = data.selected
    var response = await getMethod(url+currentPage)
    var result = await response.json();
    setItemProduct(result.content)
    setpageCount(result.totalPages)
  }
  const handlePageClickBanChay = async (data)=>{
    var currentPage = data.selected
    var response = await getMethod(urlbanchay+currentPage)
    var result = await response.json();
    setItemProductBanChay(result.content)
    setpageCountBanChay(result.totalPages)
  }


  return(
    <>
     <div class="content">
        <div id="carouselExampleControls" class="carousel slide" data-bs-ride="carousel">
            <div id="carouselindex">
                <div class="carousel-inner">
                    <div class="carousel-item active">
                        <a href=""><img src="image/banner1.webp" class="d-block w-100" alt="..."/></a>
                    </div>
                    <div class="carousel-item">
                        <a href=""><img src="image/banner2.webp" class="d-block w-100" alt="..."/></a>
                    </div>
                    <div class="carousel-item">
                        <a href=""><img src="image/banner3.webp" class="d-block w-100" alt="..."/></a>
                    </div>
                </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
            </button>
        </div>

        <div className="listdmindex owl-2-style">
      <Slider {...settings} className="owl-2">
        {itemCategories.map((item) => (
          <div key={item.id} className="media-29101">
            <a href={`product?category=${item.id}`}>
              <img src={item.imageBanner} alt={item.name} className="img-fluid" />
            </a>
            <h3>
              <a href="#">{item.name}</a>
            </h3>
          </div>
        ))}
      </Slider>
    </div>

        <div class="bannerhot1">

        </div>

        <div class="headersection">
            <h4>Sản phẩm mới</h4>
        </div>
        <div class="row" id="listproductindex">
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

        <div class="bannerhot1">

        </div>
        <div class="headersection">
            <h4>Sản phẩm bán chạy</h4>
        </div>

        <div class="row" id="listproductbanchay">
        {itemProductBanChay.map((item=>{
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
        <br/><br/>
        <ReactPaginate 
            marginPagesDisplayed={2} 
            pageCount={pageCountBanChay} 
            onPageChange={handlePageClickBanChay}
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

        <div class="headersection">
            <h4>Tin tức thời trang</h4>
        </div>

        <div class="blogindex col-sm-8">
            <div class="topblogindex">
                <h3></h3>
                <a class="xemthemblog" href="blog">Xem thêm  <i class="fa fa-arrow-right"></i> </a>
            </div>
            <div class="row listblogindex">
                <div class="col-sm-6" id="blogpridiv">
                    <a href={"blogdetail?id="+primaryBlog?.id} id="hrefimgpri"><img src={primaryBlog?.imageBanner} id="blogpriimage" class="blogpriimage"/></a>
                    <a href={"blogdetail?id="+primaryBlog?.id} class="titlepriindex" id="titlepriindex">{primaryBlog?.title}</a>
                </div>
                <div class="col-sm-6">
                    <div id="listblogindex" class="dsblogindex">
                    {itemBlog.map((item=>{
                      return <div class="singleblogindex">
                        <a href={"blogdetail?id="+item.id}>{item.title}</a>
                      </div>
                    }))}
                    </div>
                </div>
            </div>
        </div>
    </div>

    </>
  );
}


export default Home;
