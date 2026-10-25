import logofooter from '../../../assest/images/footer.png'
import {formatMoney} from '../../../services/money'


function footer(){
    async function searchMenuMobile() {
        var texts = document.getElementById("inputsearchmobile").value
        if (texts.length == 0) {
            document.getElementById("listproductsearchmobile").innerHTML = '';
            return;
        }
        var url = 'http://localhost:8080/api/product/public/findByParam?page=0&size=50&q=' + texts;
        const response = await fetch(url, {});
        var result = await response.json();
        var list = result.content;
        var main = '';
        for (var i = 0; i < list.length; i++) {
            main += `<div class="singlesearch col-md-12">
                        <div class="p40"><a href="detail?id=${list[i].id}&name=${list[i].alias}"><img class="imgprosearchp" src="${list[i].imageBanner}"></a></div>
                        <div class="p60">
                            <a href="detail?id=${list[i].id}&name=${list[i].alias}"><span class="tenspsearch">${list[i].name}</span><br>
                            <span class="tenspsearch">${formatMoney(list[i].price)}</span></a>
                        </div>
                    </div>`
        }
        document.getElementById("listproductsearchmobile").innerHTML = main;
    }

  return(
    <div id="footer">
      <footer class="text-center text-lg-start text-muted">
    <section class="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
        <div class="me-5 d-none d-lg-block"><span>Theo dõi chúng tôi tại:</span></div>
        <div>
        <a href="" class="me-4 text-reset"><i class="fab fa-facebook-f"></i></a>
        <a href="" class="me-4 text-reset"><i class="fab fa-twitter"></i></a>
        <a href="" class="me-4 text-reset"><i class="fab fa-google"></i></a>
        <a href="" class="me-4 text-reset"><i class="fab fa-instagram"></i></a>
        <a href="" class="me-4 text-reset"><i class="fab fa-linkedin"></i></a>
        <a href="" class="me-4 text-reset"><i class="fab fa-github"></i></a>
        </div>
    </section>
    <section class="">
        <div class=" text-center text-md-start mt-5">
        <div class="row mt-3">
            <div class="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
            <h6 class="text-uppercase fw-bold mb-4"><i class="fas fa-gem me-3"></i>Male fashion</h6>
            <p>
                Chúng tôi cung cấp dịch vụ thời trang giá rẻ cho nam, nữ giới trẻ với phong cách bắt kịp trend hiện nay
            </p>
            </div>
            <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 class="text-uppercase fw-bold mb-4">Sản phẩm</h6>
            <p><a href="#!" class="text-reset">Uy tín</a></p>
            <p><a href="#!" class="text-reset">Chất lượng</a></p>
            <p><a href="#!" class="text-reset">Nguồn gốc rõ ràng</a></p>
            <p><a href="#!" class="text-reset">Giá rẻ</a></p>
            </div>
            <div class="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 class="text-uppercase fw-bold mb-4">Dịch vụ</h6>
            <p><a href="#!" class="text-reset">24/7</a></p>
            <p><a href="#!" class="text-reset">bảo hành 6 tháng</a></p>
            <p><a href="#!" class="text-reset">free ship</a></p>
            <p><a href="#!" class="text-reset">lỗi 1 đổi 1</a></p>
            </div>
            <div class="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
            <h6 class="text-uppercase fw-bold mb-4">Liên hệ</h6>
            <p><i class="fas fa-home me-3"></i> Hà nội, Việt Nam</p>
            <p><i class="fas fa-envelope me-3"></i> shop@gmail.com</p>
            <p><i class="fas fa-phone me-3"></i> + 01 234 567 88</p>
            <p><i class="fas fa-print me-3"></i> + 01 234 567 89</p>
            </div>
        </div>
        </div>
    </section>
    </footer>
    <div class="modal fade" id="modalsearch" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen-xxl-down modelreplay">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title timkiemmodel" id="exampleModalLabel">Tìm kiếm</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="searchmenu searchsm">
                    <input id="inputsearchmobile" onKeyUp={()=>searchMenuMobile()} class="imputsearchmenu" placeholder="Tìm kiếm sản phẩm..."/>
                    <button class="btnsearchmenu"><i class="fa fa-search"></i></button>
                </div>

                <div id="listproductsearchmobile" class="row">
                </div>
            </div>
        </div>
        </div>
    </div>

    </div>
  );
}

export default footer;