import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,postMethodPayload, deleteMethod, uploadSingleFile} from '../../services/request';
import {formatMoney} from '../../services/money';
import { Editor } from '@tinymce/tinymce-react';
import React, { useRef } from 'react';
import Select from 'react-select';


var linkbanner = '';
var description = '';
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


var linkbanner = '';
const AdminAddCategory = ()=>{
    const [category, setCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [selectParent, setselectParent] = useState(null);
    useEffect(()=>{
        const getById = async() =>{
            var uls = new URL(document.URL)
            var id = uls.searchParams.get("id");
            if(id != null){
                var response = await getMethod('/api/category/admin/findById?id='+id)
                var result = await response.json();
                setCategory(result)
                linkbanner = result.imageBanner
                document.getElementById("primaryCate").checked = result.isPrimary
                document.getElementById("imgpreview").src = result.imageBanner
                if(result.categoryParentId != null){
                    var response = await getMethod('/api/category/public/findPrimaryCategory')
                    var cates = await response.json();
                    for(var i=0; i< cates.length; i++){
                        if(cates[i].id == result.categoryParentId){
                            setselectParent(cates[i]);
                            break;
                        }
                    }
                }
            }
        };
        getById();
        getData();
    }, []);

    const getData = async() =>{
        var response = await getMethod('/api/category/public/findPrimaryCategory')
        var result = await response.json();
        setItems(result)
    };

    
    function onchangeFile(){
        const [file] = document.getElementById("fileimage").files
        if (file) {
            document.getElementById("imgpreview").src = URL.createObjectURL(file)
        }
    }


    async function saveCategory() {
        document.getElementById("loading").style.display = 'block'
        var uls = new URL(document.URL)
        var id = uls.searchParams.get("id");
        var linktam = await uploadSingleFile(document.getElementById('fileimage'))
        if(linktam != null) linkbanner = linktam
        var url = '/api/category/admin/create';
        if (id != null) {
            url = '/api/category/admin/update';
        }
        var obj = {
            "id": id,
            "name": document.getElementById("catename").value,
            "isPrimary": document.getElementById("primaryCate").checked,
            "imageBanner": linkbanner
        };
        if(selectParent != null){
            obj.category = { id: selectParent.id };
        }
        const response = await postMethodPayload(url,obj)
        if (response.status < 300) {
            Swal.fire({
                title: "Thông báo",
                text: "Thành công!",
                preConfirm: () => {
                    window.location.href = 'category'
                }
            });
        }
        if (response.status == 417) {
            var result = await response.json()
            toast.warning(result.defaultMessage);
        }
        document.getElementById("loading").style.display = 'none'
    }

    return (
        <>
         <div class="col-sm-12 header-sps">
            <div class="title-add-admin">
                <h4>Thêm/ cập nhật danh mục</h4>
            </div>
        </div>
        <div class="col-sm-12">
            <main class="main row">
            <div class="col-sm-5">
                    <label class="lb-form">Tên danh mục</label>
                    <input defaultValue={category?.name} id="catename" type="text" class="form-control"/>
                    <label class="checkbox-custom">Danh mục chính 
                        <input id="primaryCate" type="checkbox"/>
                        <span class="checkmark-checkbox"></span>
                    </label><br/>
                    <label class="lb-form">Ảnh danh mục</label>
                    <input onChange={onchangeFile} id="fileimage" type="file" class="form-control"/>
                    <img id="imgpreview" className='imgadd'/>
                    <label class="lb-form">Danh mục cha</label>
                    <Select
                        options={items}
                        value={selectParent}
                        onChange={setselectParent}
                        getOptionLabel={(option) => option.name} 
                        getOptionValue={(option) => option.id}    
                        closeMenuOnSelect={false}
                        name='danhmuccha'
                        placeholder="Chọn danh mục cha"
                    />
                    <br/>
                    <div id="loading">
                        <div class="bar1 bar"></div>
                    </div><br/>
                    <button onClick={()=>saveCategory()} class="btn btn-success form-control action-btn">Thêm/ Cập nhật danh mục</button>
                </div>
            </main>
        </div>
        </>
    );
}

export default AdminAddCategory;