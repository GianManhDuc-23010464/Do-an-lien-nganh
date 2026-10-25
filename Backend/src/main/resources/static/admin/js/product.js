const listFile = [];

var size = 8;
async function loadProduct(page, param, listcate) {
    if (param == null) {
        param = "";
    }
    var result = null;
    if (listcate == null) {
        var url = 'http://localhost:8080/api/product/public/findByParam?page=' + page + '&size=' + size + '&q=' + param;
        const response = await fetch(url, {
            method: 'GET'
        });
        result = await response.json();
    } else {
        var url = 'http://localhost:8080/api/product/public/searchFull?page=' + page + '&size=' + size;
        const response = await fetch(url, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(listcate)
        });
        result = await response.json();
    }
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;

    var main = '';
    for (i = 0; i < list.length; i++) {
        var listdm = '<div class="listtag">'
        for (j = 0; j < list[i].productCategories.length; j++) {
            listdm += `<a href="" class="tagcauhoi">.${list[i].productCategories[j].category.name}</a>`;
        }
        listdm += '</div>';
        main += `<tr>
                    <td>#${list[i].id}</td>
                    <td><img src="${list[i].imageBanner}" style="width: 100px;"></td>
                    <td>${list[i].code}</td>
                    <td>${listdm}</td>
                    <td>${list[i].name}</td>
                    <td>${formatmoney(list[i].price)}</td>
                    <td>${list[i].createdTime}<br>${list[i].createdDate}</td>
                    <td>${list[i].quantitySold}</td>
                    <td class="sticky-col">
                        <i onclick="deleteProduct(${list[i].id})" class="fa fa-trash-alt iconaction"></i>
                        <a href="addproduct?id=${list[i].id}"><i class="fa fa-edit iconaction"></i><br></a>
                    </td>
                </tr>`
    }
    document.getElementById("listproduct").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadProduct(${(Number(i) - 1)},${param},${listcate})" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}

async function filterByCate() {
    loadProduct(0, "", $("#listdpar").val());
}


async function loadAProduct() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    if (id != null) {
        var url = 'http://localhost:8080/api/product/admin/findById?id=' + id;
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        var result = await response.json();
        console.log(result)
        document.getElementById("codesp").value = result.code
        document.getElementById("namesp").value = result.name
        document.getElementById("alias").value = result.alias
        document.getElementById("price").value = result.price
        document.getElementById("anhdathem").style.display = 'block'
        linkbanner = result.imageBanner
        document.getElementById("imgpreproduct").src = result.imageBanner
        tinyMCE.get('editor').setContent(result.description)
        var main = ''
        for (i = 0; i < result.productImages.length; i++) {
            main += `<div id="imgdathem${result.productImages[i].id}" class="col-md-3 col-sm-4 col-4">
                        <img style="width: 90%;" src="${result.productImages[i].linkImage}" class="image-upload">
                        <button onclick="deleteProductImage(${result.productImages[i].id})" class="btn btn-danger form-control">Xóa ảnh</button>
                    </div>`
        }
        document.getElementById("listanhdathem").innerHTML = main
        await loadAllCategorySelect();
        var listCate = []
        for (i = 0; i < result.productCategories.length; i++) {
            listCate.push(result.productCategories[i].category.id);
        }
        console.log(listCate)
        $("#listdpar").val(listCate).change();;
        var color = result.productColors;
        var mcl = ''
        for (i = 0; i < color.length; i++) {
            var blocks = '';
            var size = color[i].productSizes;
            for (j = 0; j < size.length; j++) {
                blocks += ` <div class="singelsizeblock">
                            <input value="${size[j].id}" type="hidden" class="idsize">
                            <input value="${size[j].sizeName}" placeholder="tên size" class="sizename">
                            <input value="${size[j].quantity}" placeholder="Số lượng" class="sizequantity">
                            <i onclick="deleteProductSize(${size[j].id})" class="fa fa-trash-alt trashsize"></i>
                        </div>`
            }
            mcl += `<div class="col-sm-6">
            <div class="singlecolor row">
                <div class="col-12"><i onclick="deleteProductColor(${color[i].id})" class="fa fa-trash pointer"></i></div>
                <div class="col-8 inforcolor">
                    <input type="hidden" value="${color[i].id}" class="idcolor">
                    <label class="lb-form">Tên màu:</label>
                    <input type="text" value="${color[i].colorName}" class="form-control colorName">
                    <label class="lb-form">Ảnh màu</label>
                    <input onchange="priviewImg(this)" type="file" class="form-control fileimgclo">
                </div>
                <div class="col-4 divimgpre">
                    <img class="imgpreview" src="${color[i].linkImage}" style="width: 100%;">
                </div>
                <span onclick="addSizeBlock(this)" class="pointer btnaddsize"><i class="fa fa-plus"></i> Thêm size</span>
                <div class="listsizeblock">
                   ${blocks}
                </div>
            </div></div>`
        }
        document.getElementById("listcolorblock").innerHTML = mcl
    }
}

var linkbanner = '';
async function saveProduct() {
    document.getElementById("loading").style.display = 'block'
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");

    var url = 'http://localhost:8080/api/product/admin/create';
    if (id != null) {
        url = 'http://localhost:8080/api/product/admin/update';
    }
    var codesp = document.getElementById("codesp").value
    var namesp = document.getElementById("namesp").value
    var price = document.getElementById("price").value
    var alias = document.getElementById("alias").value
    var listdpar = $("#listdpar").val();
    var description = tinyMCE.get('editor').getContent()
    await uploadFile(document.getElementById("imgbanner"));
    var listLinkImg = await uploadMultipleFileNotResp();
    await loadColor();
    var product = {
        "id": id,
        "code": codesp,
        "alias": alias,
        "name": namesp,
        "imageBanner": linkbanner,
        "price": price,
        "description": description,
        "listCategoryIds": listdpar,
        "linkLinkImages": listLinkImg,
        "colors": listColor,
    }
    console.log(product)
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(product)
    });
    var result = await response.json();
    console.log(result)
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "thêm/sửa sản phẩm thành công",
                type: "success"
            },
            function() {
                document.getElementById("loading").style.display = 'none'
                window.location.reload();
            });
    } else {
        swal({
                title: "Thông báo",
                text: "thêm/sửa sản phẩm thất bại",
                type: "error"
            },
            function() {
                document.getElementById("loading").style.display = 'none'
                window.location.reload();
            });
    }
}


async function deleteProduct(id) {
    var con = confirm("Bạn chắc chắn muốn xóa sản phẩm này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/product/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa sản phẩm thành công!");
        await new Promise(r => setTimeout(r, 1000));
        window.location.reload();
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}


async function deleteProductImage(id) {
    var con = confirm("Bạn muốn xóa ảnh này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/product-image/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa ảnh thành công!");
        document.getElementById("imgdathem" + id).style.display = 'none';
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function deleteProductSize(id) {
    var con = confirm("Bạn muốn xóa size này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/product-size/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa thành công!");
        await new Promise(r => setTimeout(r, 1000));
        loadAProduct();
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function deleteProductColor(id) {
    var con = confirm("Bạn muốn xóa màu này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/product-color/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa thành công!");
        await new Promise(r => setTimeout(r, 1000));
        loadAProduct();
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}


var listColor = [];
var listLinkImgCt = [];
async function loadColor() {
    var list = document.getElementById("listcolorblock").getElementsByClassName("singlecolor");
    var listF = []
    for (i = 0; i < list.length; i++) {
        var singleColor = list[i];
        var idcolor = singleColor.getElementsByClassName("idcolor")[0];
        var colorName = singleColor.getElementsByClassName("colorName")[0];
        listF.push(singleColor.getElementsByClassName("fileimgclo")[0]);
        var obj = {
            "id": idcolor.value == '' ? null : idcolor.value,
            "colorName": colorName.value,
            "hasFile": singleColor.getElementsByClassName("fileimgclo")[0].files.length == 0 ? false : true,
            "linkImage": null
        }
        var listsizes = []
        var sizeblockList = singleColor.getElementsByClassName("singelsizeblock");
        for (j = 0; j < sizeblockList.length; j++) {
            var size = sizeblockList[j];
            var objsize = {
                "id": size.getElementsByClassName("idsize")[0].value == '' ? null : size.getElementsByClassName("idsize")[0].value,
                "sizeName": size.getElementsByClassName("sizename")[0].value,
                "quantity": size.getElementsByClassName("sizequantity")[0].value,
            }
            listsizes.push(objsize)
        }
        console.log(listsizes);
        obj.size = listsizes;
        listColor.push(obj)
    }
    var listImg = await uploadMultipleFile(listF);
    console.log(listImg)
        // for (i = 0; i < listImg.length; i++) {
        //     listColor[listImg[i].id].linkImage = listImg[i].link
        // }
    for (i = 0; i < listImg.length; i++) {
        for (j = 0; j < listColor.length; j++) {
            if (listColor[j].hasFile == true) {
                if (listColor[j].linkImage == null) {
                    listColor[j].linkImage = listImg[i].link;
                    break;
                }
            }
        }
    }
    console.log(listColor)
}

async function uploadMultipleFile(listF) {
    const formData = new FormData()
    for (i = 0; i < listF.length; i++) {
        formData.append("file", listF[i].files[0])
    }
    var urlUpload = 'http://localhost:8080/api/public/upload-multiple-file-order-response';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    return await res.json();
}

async function uploadMultipleFileNotResp() {
    const formData = new FormData()
    for (i = 0; i < listFile.length; i++) {
        formData.append("file", listFile[i])
    }
    var urlUpload = 'http://localhost:8080/api/public/upload-multiple-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if (res.status < 300) {
        return await res.json();
    } else {
        return [];
    }
}


async function uploadFile(filePath) {
    const formData = new FormData()
    formData.append("file", filePath.files[0])
    var urlUpload = 'http://localhost:8080/api/public/upload-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if (res.status < 300) {
        linkbanner = await res.text();
    }
}

function priviewImg(e) {
    var dv = e.parentNode.parentNode;
    var img = dv.getElementsByClassName("divimgpre")[0].getElementsByClassName("imgpreview")[0]
    const [file] = e.files
    if (file) {
        img.src = URL.createObjectURL(file)
    }
}

function addBlockColor() {
    var main =
        `<div class="col-sm-6">
        <div class="singlecolor row">
            <div class="col-12"><i onclick="removeColorBlock(this)" class="fa fa-trash pointer"></i></div>
            <div class="col-8 inforcolor">
                <input type="hidden" class="idcolor">
                <label class="lb-form">Tên màu:</label>
                <input type="text" class="form-control colorName">
                <label class="lb-form">Ảnh màu</label>
                <input onchange="priviewImg(this)" type="file" class="form-control fileimgclo">
            </div>
            <div class="col-4 divimgpre">
                <img class="imgpreview" src="" style="width: 100%;">
            </div>
            <span onclick="addSizeBlock(this)" class="pointer btnaddsize"><i class="fa fa-plus"></i> Thêm size</span>
            <div class="listsizeblock">
                <!-- <div class="singelsizeblock">
                    <input type="hidden" class="idsize">
                    <input placeholder="tên size" class="sizename">
                    <input placeholder="Số lượng" value="0" class="sizequantity">
                    <i onclick="removeInputSize(this)" class="fa fa-trash-alt trashsize"></i>
                </div> -->
            </div>
        </div></div>`
    document.getElementById("listcolorblock").insertAdjacentHTML('beforeend', main);
}

function addSizeBlock(e) {
    var dv = e.parentNode;
    var listSize = dv.getElementsByClassName("listsizeblock")[0];
    var main = `<div class="singelsizeblock">
                    <input type="hidden" class="idsize">
                    <input placeholder="tên size" class="sizename">
                    <input placeholder="Số lượng" value="0" class="sizequantity">
                    <i onclick="removeInputSize(this)" class="fa fa-trash-alt trashsize"></i>
                </div>`
    listSize.insertAdjacentHTML('beforeend', main);
}

function removeColorBlock(e) {
    var dv = e.parentNode.parentNode;
    dv.remove();
}

function removeInputSize(e) {
    var dv = e.parentNode;
    dv.remove();
}

async function loadAllCategorySelect() {
    var url = 'http://localhost:8080/api/category/public/findAllList';
    const response = await fetch(url, {
        method: 'GET'
    });
    var list = await response.json();
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].id}">${list[i].name}</option>`
    }
    document.getElementById("listdpar").innerHTML = main
    const ser = $("#listdpar");
    ser.select2({
        placeholder: "Chọn danh mục sản phẩm",
    });
}

function loadInit() {
    $('input#choosefile').change(function() {
        var files = $(this)[0].files;
    });
    document.querySelector('#choosefile').addEventListener("change", previewImages);

    function previewImages() {
        var files = $(this)[0].files;
        for (i = 0; i < files.length; i++) {
            listFile.push(files[i]);
        }

        var preview = document.querySelector('#preview');

        // if (this.files) {
        //     [].forEach.call(this.files, readAndPreview);
        // }
        for (i = 0; i < files.length; i++) {
            readAndPreview(files[i]);
        }

        function readAndPreview(file) {

            if (!/\.(jpe?g|png|gif)$/i.test(file.name)) {
                return alert(file.name + " is not an image");
            }

            var reader = new FileReader(file);

            reader.addEventListener("load", function() {
                document.getElementById("chon-anhs").className = 'col-sm-3';
                document.getElementById("chon-anhs").style.height = '100px';
                document.getElementById("chon-anhs").style.marginTop = '5px';
                document.getElementById("choose-image").style.height = '120px';
                document.getElementById("numimage").innerHTML = '';
                document.getElementById("camera").style.fontSize = '20px';
                document.getElementById("camera").style.marginTop = '40px';
                document.getElementById("camera").className = 'fas fa-plus';
                document.getElementById("choose-image").style.width = '90%';

                var div = document.createElement('div');
                div.className = 'col-md-3 col-sm-6 col-6';
                div.style.height = '120px';
                div.style.paddingTop = '5px';
                div.marginTop = '100px';
                preview.appendChild(div);

                var img = document.createElement('img');
                img.src = this.result;
                img.style.height = '85px';
                img.style.width = '90%';
                img.className = 'image-upload';
                img.style.marginTop = '5px';
                div.appendChild(img);

                var button = document.createElement('button');
                button.style.height = '30px';
                button.style.width = '90%';
                button.innerHTML = 'xóa'
                button.className = 'btn btn-warning';
                div.appendChild(button);

                button.addEventListener("click", function() {
                    div.remove();
                    console.log(listFile.length)
                    for (i = 0; i < listFile.length; i++) {
                        if (listFile[i] === file) {
                            listFile.splice(i, 1);
                        }
                    }
                    console.log(listFile.length)
                });
            });

            reader.readAsDataURL(file);

        }

    }

}