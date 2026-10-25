import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,postMethodPayload, deleteMethod, uploadSingleFile, uploadMultipleFile} from '../../services/request';
import {formatMoney} from '../../services/money';
import { Editor } from '@tinymce/tinymce-react';
import React, { useRef } from 'react';
import Select from 'react-select';


var linkbanner = '';
var description = '';
const listFile = [];
var listCategory = [];
async function saveBlog() {
    document.getElementById("loading").style.display = 'block'
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");

    var linktam = await uploadSingleFile(document.getElementById('fileimage'))
    if(linktam != null) linkbanner = linktam
    var blog = {
        "id": id,
        "title": document.getElementById("title").value,
        "description": document.getElementById("description").value,
        "content": description,
        "imageBanner": linkbanner,
        "primaryBlog": document.getElementById("primaryBlog").checked
    }

    const response = await postMethodPayload('/api/blog/admin/create',blog)
    if (response.status < 300) {
        Swal.fire({
            title: "Thông báo",
            text: "thêm/sửa blog thành công!",
            preConfirm: () => {
                window.location.href = 'blog'
            }
        });
    }
    if (response.status == 417) {
        var result = await response.json()
        toast.warning(result.defaultMessage);
    }
    document.getElementById("loading").style.display = 'none'
}





const AdminAddProduct = ()=>{
    const editorRef = useRef(null);
    const [product, setProduct] = useState(null);
    const [category, setcategory] = useState([]);
    const [selectCategory, setSelectcategory] = useState([]);
    const [colorBlocks, setColorBlocks] = useState([]); // Danh sách khối màu
    const [colorBlockUpdate, setColorBlockUpdate] = useState([]); // Danh sách khối màu
    const [selectedSizes, setSelectedSizes] = useState({}); // Lưu thông tin size của từng khối màu

    useEffect(()=>{
        getCategory();
        const getProduct = async() =>{
            var uls = new URL(document.URL)
            var id = uls.searchParams.get("id");
            if(id != null){
                var response = await getMethod('/api/product/public/findById?id='+id)
                var result = await response.json();
                console.log(result);
                
                setProduct(result)
                linkbanner = result.imageBanner
                description = result.description;
                document.getElementById("imgpreview").src = result.imageBanner
                var listcat = result.productCategories.map(obj => obj.category)
                setSelectcategory(listcat)
                listCategory = listcat.map(obj => obj.id)
                const newColorBlocks = result.productColors.map((obj) => ({
                    ...obj,
                    image: obj.linkImage,
                    sizes: obj.productSizes,
                }));
    
                setColorBlockUpdate(newColorBlocks);
            }
        };
        getProduct();
    }, []);

    const getCategory = async() =>{
        var response = await getMethod('/api/category/public/findAllList')
        var result = await response.json();
        setcategory(result)
    };
    
    function handleEditorChange(content, editor) {
        description = content;
    }
    
    function onchangeFile(){
        const [file] = document.getElementById("fileimage").files
        if (file) {
            document.getElementById("imgpreview").src = URL.createObjectURL(file)
        }
    }

    function openChonAnh(){
        document.getElementById("choosefile").click();
    }

    function changeDanhMuc(option){
        setSelectcategory(option)
        listCategory = option.map(obj => obj.id);
        console.log(listCategory);
    }

    
    async function deleteImage(id) {
        var con = window.confirm("Bạn muốn xóa ảnh này?");
        if (con == false) {
            return;
        }
        const response = await deleteMethod('/api/product-image/admin/delete?id=' + id)
        if (response.status < 300) {
            toast.success("xóa ảnh thành công!");
            document.getElementById("imgdathem" + id).style.display = 'none';
        }else toast.warning("Thất bại");
    }

    const addBlockColor = () => {
        const newBlock = {
        id: Date.now(),
        colorName: '',
        image: null,
        fileIp: null,
        sizes: [],
        };
        setColorBlocks([...colorBlocks, newBlock]);
    };

    const addSizeBlock = (blockId) => {
        const newSize = { id: Date.now(), sizeName: '', quantity: 0 };
        setSelectedSizes((prev) => ({
        ...prev,
        [blockId]: [...(prev[blockId] || []), newSize],
        }));
    };

    const removeSizeBlock = (blockId, sizeId) => {
        setSelectedSizes((prev) => ({
        ...prev,
        [blockId]: prev[blockId].filter((size) => size.id !== sizeId),
        }));
    };

    async function saveProduct() {
        document.getElementById("loading").style.display = 'block'
        var uls = new URL(document.URL)
        var id = uls.searchParams.get("id");
    
        var url = '/api/product/admin/create';
        if (id != null) {
            url = '/api/product/admin/update';
        }
        var linktam = await uploadSingleFile(document.getElementById('fileimage'))
        if(linktam != null) linkbanner = linktam
        var listLinkImg = await uploadMultipleFile(listFile);
        var colors = await getColor();
        // console.log(colors);
        // return;
        var payload = {
            "id": id,
            "code": document.getElementById("codesp").value,
            "alias": document.getElementById("alias").value,
            "name": document.getElementById("namesp").value,
            "imageBanner": linkbanner,
            "price": document.getElementById("price").value,
            "description": description,
            "listCategoryIds": listCategory,
            "linkLinkImages": listLinkImg,
            "colors": colors
        }
        console.log(payload)
        const response = await postMethodPayload(url, payload)
        var result = await response.json();
        console.log(result)
        if (response.status < 300) {
            Swal.fire({
                title: "Thông báo",
                text: "thêm/sửa sản phẩm thành công!",
                preConfirm: () => {
                    window.location.href = 'product'
                }
            });
        } else {
            toast.error("Thêm thất bại")
        }
    }
    

    async function getColor() {
        const saveData = colorBlocks.map((block) => {
            const sizes = selectedSizes[block.id] ? selectedSizes[block.id].map(size => ({ ...size, id: null })) : [];
            
            return {
                id: null, 
                colorName: block.colorName,
                linkImage: block.image,
                size: sizes, 
            };
        });
        const updateData = colorBlockUpdate.map((block) => {
            return {
                id: block.id, 
                colorName: block.colorName,
                linkImage: block.image,
                size: block.sizes, 
            };
        });
        const mergedArray = [...saveData, ...updateData];
        return mergedArray;
    }

    const handleFileChange = async (blockId, file, e) => {
        console.log('File selected: ', e); 
        var img = await uploadSingleFile(e.target)
        const reader = new FileReader();
        reader.onload = (event) => {
          console.log('FileReader result: ', event.target.result); // Log kết quả ảnh
      
          setColorBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
              block.id === blockId
                ? { ...block, fileIp: file, image: img }
                : block
            )
          );
        };
        reader.readAsDataURL(file);
    };


    const handleSizeChange = (blockIndex, sizeIndex, field, value) => {
        setColorBlockUpdate((prevBlocks) =>
          prevBlocks.map((block, i) =>
            i === blockIndex
              ? {
                  ...block,
                  sizes: block.sizes.map((size, j) =>
                    j === sizeIndex ? { ...size, [field]: value } : size
                  ),
                }
              : block
          )
        );
    };

    const addSize = (blockIndex) => {
        setColorBlockUpdate((prevBlocks) =>
          prevBlocks.map((block, i) =>
            block.id === blockIndex
              ? {
                  ...block,
                  sizes: [
                    ...(block.sizes || []), 
                    { id: null, sizeName: '', quantity: 0 },
                  ],
                }
              : block
          )
        );
    };

    const removeSize = async (blockId, sizeIndex, sizeId) => {
        if(sizeId != null){
            var con = window.confirm("Xác nhận xóa màu sắc này");
            if(con == false){
                return
            }
        }
        setColorBlockUpdate((prevBlocks) =>
          prevBlocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  sizes: block.sizes.filter((_, idx) => idx !== sizeIndex),
                }
              : block
          )
        );
        if(sizeId != null){
            const res = await deleteMethod("/api/product-size/admin/delete?id="+sizeId);
            if(res.status < 300){
                toast.success("Xóa kích thước thành công")
            }
            if(res.status == 417){
                var result = await res.json();
                toast.error(result.defaultMessage);
            }
        }
    };

    const removeBlockUpdate = async (blockId) => {
        var con = window.confirm("Xác nhận xóa màu sắc này");
        if(con == false){
            return
        }
        setColorBlockUpdate((prevBlocks) =>
          prevBlocks.filter((block) => block.id !== blockId)
        );
        const res = await deleteMethod("/api/product-color/admin/delete?id="+blockId);
        if(res.status < 300){
            toast.success("Xóa Màu sắc thành công")
        }
        if(res.status == 417){
            var result = await res.json();
            toast.error(result.defaultMessage);
        }
    };


    const handleFileChangeUpdate = async (blockId, file, e) => {
        var img = await uploadSingleFile(e.target)
        const reader = new FileReader();
        reader.onload = (event) => {
          setColorBlockUpdate((prevBlocks) =>
            prevBlocks.map((block) =>
              block.id === blockId
                ? { ...block, fileIp: file, image: img }
                : block
            )
          );
        };
        reader.readAsDataURL(file);
    };
 
    return (
    <div class="col-sm-12">
    <main class="main">
        <div class="col-sm-12 header-sps">
            <div class="title-add-admin"><p>Hãy thêm sản phẩm cùng kích thước và màu sắc sản phẩm</p></div>
        </div>
        <div class="group-tabs">
            <ul class="nav nav-tabs" role="tablist">
                <li class="tabtk nav-item active"><a data-toggle="tab" class="nav-link" aria-current="page" href="#home">Thông tin sản phẩm</a></li>
                <li class="tabtk nav-item"><a href="#profile" data-toggle="tab" class="nav-link">Màu sắc/ kích thước</a></li>
            </ul>
        </div>
        <div class="tab-content contentab">
            <div role="tabpanel" class="tab-pane active" id="home">
                <div class="col-sm-12">
                    <div class="form-add">
                        <div class="row">
                            <div class="col-md-4 col-sm-12 col-12">
                                <label class="lb-form">Mã sản phẩm</label>
                                <input defaultValue={product?.code} id="codesp" type="text" class="form-control" />
                                <label class="lb-form">Tên sản phẩm</label>
                                <input defaultValue={product?.name} id="namesp" type="text" class="form-control" />
                                <label class="lb-form">Alias</label>
                                <input defaultValue={product?.alias} id="alias" type="text" class="form-control" />
                                <label class="lb-form">Giá tiền</label>
                                <input defaultValue={product?.price} id="price" type="text" class="form-control" />
                                <label class="lb-form">Danh mục sản phẩm</label>
                                <Select isMulti options={category} value={selectCategory} onChange={changeDanhMuc} placeholder="Chọn danh mục"
                                    getOptionLabel={(option) => option.name} 
                                    getOptionValue={(option) => option.id} /> 
                                <br/>
                                <div class="loading" id="loading">
                                    <div class="bar1 bar"></div>
                                </div><br/>
                                <button onClick={()=>saveProduct()} class="btn btn-primary form-control">Thêm/ cập nhật</button>
                            </div>
                            <div class="col-md-8 col-sm-12 col-12">
                                <label class="lb-form">Ảnh nền</label>
                                <input onChange={()=>onchangeFile()} id="fileimage" type="file" class="form-control" />
                                <img id="imgpreview" className='imgadd' />
                                <label class="lb-form">Ảnh phụ</label>
                                <input onChange={()=>previewImages()} id="choosefile" multiple type="file" style={{visibility:'hidden'}} />
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="row" id="preview">
                                            <div class="col-md-3" id="chon-anhs" style={{height:'100%'}}>
                                                <div style={{height:"120px"}} id="choose-image" class="choose-image" onClick={()=>openChonAnh()}>
                                                    <p><i class="fas fa-camera" id="camera"></i></p> <p id="numimage">Đăng từ 3 ảnh</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {product !== null && 
                                        <div class="row" id="anhdathem">
                                            <div class="col-sm-12">
                                                <h4 style={{marginTop:'30px'}}>Ảnh đã thêm</h4>
                                            </div>
                                            <div id="listanhdathem" class="row">
                                            {product?.productImages.map((item=>{
                                                return <div id={"imgdathem"+item.id} class="col-md-3 col-sm-6 col-6">
                                                <img style={{width:'100%'}} src={item.linkImage} class="image-upload" />
                                                <button onClick={()=>deleteImage(item.id)} class="btn btn-danger form-control">Xóa ảnh</button>
                                            </div> 
                                            }))}
                                            </div>
                                        </div>
                                    }
                                </div>
                                <label class="lb-form">Mô tả sản phẩm</label>
                                <Editor name='editor' tinymceScriptSrc={'https://cdn.tiny.cloud/1/f6s0gxhkpepxkws8jawvfwtj0l9lv0xjgq1swbv4lgcy3au3/tinymce/6/tinymce.min.js'}
                                        onInit={(evt, editor) => editorRef.current = editor} 
                                        initialValue={product==null?'':product.description}
                                        onEditorChange={handleEditorChange}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane" id="profile">
                <div class="row">
                    <div id="listcolorblock" class="col-md-12 col-sm-12 col-12 row" style={{paddingTop:'20px'}}>
                    {colorBlockUpdate.map((block) => (
                        <div className="col-sm-6" key={block.id}>
                            <div className="singlecolor row">
                            <div className="col-12">
                                <i
                                    onClick={() => removeBlockUpdate(block.id)}
                                    className="fa fa-trash pointer"
                                ></i>
                            </div>
                            <div className="col-8 inforcolor">
                                <label className="lb-form">Tên màu:</label>
                                <input
                                type="text"
                                className="form-control colorName"
                                value={block.colorName}
                                onChange={(e) =>
                                    setColorBlockUpdate(
                                    colorBlockUpdate.map((b) =>
                                        b.id === block.id ? { ...b, colorName: e.target.value } : b
                                    )
                                    )
                                }
                                />
                                <label className="lb-form">Ảnh màu:</label>
                                <input
                                type="file"
                                className="form-control fileimgclo"
                                onChange={(e) => handleFileChangeUpdate(block.id, e.target.files[0], e)}
                                />
                            </div>
                            <div className="col-4 divimgpre">
                                {block.image && <img className="imgpreview" src={block.image} alt="preview" />}
                            </div>
                            <span onClick={() => addSize(block.id)} className="pointer btnaddsize">
                                <i className="fa fa-plus"></i> Thêm size
                            </span>
                            <div className="listsizeblock">
                                {block.sizes.map((size, sizeIndex) => (
                                <div className="singelsizeblock" key={sizeIndex}>
                                    <input type="hidden" className="idsize" value={size.id || ''} />
                                    <input
                                    placeholder="Tên size"
                                    className="sizename"
                                    value={size.sizeName || ''}
                                    onChange={(e) =>
                                        setColorBlockUpdate((prevBlocks) =>
                                        prevBlocks.map((b) =>
                                            b.id === block.id
                                            ? {
                                                ...b,
                                                sizes: b.sizes.map((s, idx) =>
                                                    idx === sizeIndex ? { ...s, sizeName: e.target.value } : s
                                                ),
                                                }
                                            : b
                                        )
                                        )
                                    }
                                    />
                                    <input
                                    placeholder="Số lượng"
                                    className="sizequantity"
                                    type="number"
                                    value={size.quantity}
                                    onChange={(e) =>
                                        setColorBlockUpdate((prevBlocks) =>
                                        prevBlocks.map((b) =>
                                            b.id === block.id
                                            ? {
                                                ...b,
                                                sizes: b.sizes.map((s, idx) =>
                                                    idx === sizeIndex ? { ...s, quantity: parseInt(e.target.value) } : s
                                                ),
                                                }
                                            : b
                                        )
                                        )
                                    }
                                    />
                                    <i onClick={() => removeSize(block.id, sizeIndex, size.id)} className="fa fa-trash trashsize"></i>
                                </div>
                                ))}
                            </div>
                            </div>
                        </div>
                    ))}


                    
                    {colorBlocks.map((block) => (
                    <div className="col-sm-6" key={block.id}>
                        <div className="singlecolor row">
                        <div className="col-12">
                            <i
                            onClick={() =>
                                setColorBlocks(colorBlocks.filter((b) => b.id !== block.id))
                            }
                            className="fa fa-trash pointer"
                            ></i>
                        </div>
                        <div className="col-8 inforcolor">
                            <label className="lb-form">Tên màu:</label>
                            <input
                            type="text"
                            className="form-control colorName"
                            value={block.colorName}
                            onChange={(e) =>
                                setColorBlocks(
                                colorBlocks.map((b) =>
                                    b.id === block.id ? { ...b, colorName: e.target.value } : b
                                )
                                )
                            }
                            />
                            <label className="lb-form">Ảnh màu:</label>
                            <input
                                type="file"
                                className="form-control fileimgclo"
                                onChange={(e) => handleFileChange(block.id, e.target.files[0], e)}
                                />
                        </div>
                        <div className="col-4 divimgpre">
                            {block.image && (
                            <img className="imgpreview" src={block.image} alt="preview" />
                            )}
                        </div>
                        <span
                            onClick={() => addSizeBlock(block.id)}
                            className="pointer btnaddsize"
                        >
                            <i className="fa fa-plus"></i> Thêm size
                        </span>
                        <div className="listsizeblock">
                            {selectedSizes[block.id] &&
                            selectedSizes[block.id].map((size) => (
                                <div className="singelsizeblock" key={size.id}>
                                <input
                                    type="hidden"
                                    className="idsize"
                                    value={size.id}
                                />
                                <input
                                    placeholder="tên size"
                                    className="sizename"
                                    value={size.name}
                                    onChange={(e) => {
                                    setSelectedSizes((prev) => ({
                                        ...prev,
                                        [block.id]: prev[block.id].map((s) =>
                                        s.id === size.id ? { ...s, sizeName: e.target.value } : s
                                        ),
                                    }));
                                    }}
                                />
                                <input
                                    placeholder="Số lượng"
                                    className="sizequantity"
                                    type="number"
                                    value={size.quantity}
                                    onChange={(e) => {
                                    setSelectedSizes((prev) => ({
                                        ...prev,
                                        [block.id]: prev[block.id].map((s) =>
                                        s.id === size.id
                                            ? { ...s, quantity: parseInt(e.target.value) }
                                            : s
                                        ),
                                    }));
                                    }}
                                />
                                <i
                                    onClick={() => removeSizeBlock(block.id, size.id)}
                                    className="fa fa-trash trashsize"
                                ></i>
                                </div>
                            ))}
                        </div>
                        </div>
                    </div>
                    ))}
                    </div>
                </div>
                <button onClick={()=>addBlockColor()} id="myBtn"><i class="fa fa-plus-circle"></i></button>
            </div>
        </div>
    </main>
    </div>
    );

}

    function previewImages() {
        var files = document.getElementById("choosefile").files;
        for (var i = 0; i < files.length; i++) {
            listFile.push(files[i]);
        }

        var preview = document.querySelector('#preview');

        for (i = 0; i < files.length; i++) {
            readAndPreview(files[i]);
        }

        function readAndPreview(file) {

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
export default AdminAddProduct;
