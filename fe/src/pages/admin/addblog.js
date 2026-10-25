import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,postMethodPayload, deleteMethod, uploadSingleFile} from '../../services/request';
import {formatMoney} from '../../services/money';
import { Editor } from '@tinymce/tinymce-react';
import React, { useRef } from 'react';


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



const AdminAddBlog = ()=>{
    const editorRef = useRef(null);
    const [blog, setItem] = useState(null);
    useEffect(()=>{
        const getBaiViet = async() =>{
            var uls = new URL(document.URL)
            var id = uls.searchParams.get("id");
            if(id != null){
                var response = await getMethod('/api/blog/public/findById?id='+id)
                var result = await response.json();
                setItem(result)
                linkbanner = result.imageBanner
                description = result.content;
                document.getElementById("primaryBlog").checked = result.primaryBlog
                document.getElementById("imgpreview").src = result.imageBanner
            }
        };
        getBaiViet();
    }, []);

    
    function handleEditorChange(content, editor) {
        description = content;
    }
    
    function onchangeFile(){
        const [file] = document.getElementById("fileimage").files
        if (file) {
            document.getElementById("imgpreview").src = URL.createObjectURL(file)
        }
    }

    return (
        <>
         <div class="col-sm-12 header-sps">
            <div class="title-add-admin">
                <h4>Thêm/ cập nhật bài viết</h4>
            </div>
        </div>
        <div class="col-sm-12">
            <main class="main row">
                <div class="col-sm-5">
                    <label class="lb-form">Tiêu đề blog</label>
                    <input defaultValue={blog?.title} id="title" type="text" class="form-control"/>
                    <label class="checkbox-custom">Blog chính 
                        <input id="primaryBlog" type="checkbox"/>
                        <span class="checkmark-checkbox"></span>
                    </label><br/>
                    <label class="lb-form">Ảnh bài viết</label>
                    <input onChange={onchangeFile} id="fileimage" type="file" class="form-control"/>
                    <img id="imgpreview" className='imgadd'/>
                    <label class="lb-form">Mô tả</label>
                    <textarea defaultValue={blog?.description} id="description" class="form-control" rows={3}></textarea>
                </div>
                <div class="col-md-7">
                    <label>Nội dung</label>
                    <Editor name='editor' tinymceScriptSrc={'https://cdn.tiny.cloud/1/f6s0gxhkpepxkws8jawvfwtj0l9lv0xjgq1swbv4lgcy3au3/tinymce/6/tinymce.min.js'}
                                        onInit={(evt, editor) => editorRef.current = editor} 
                                        initialValue={blog==null?'':blog.content}
                                        onEditorChange={handleEditorChange}/>
                    <div id="loading">
                        <div class="bar1 bar"></div>
                    </div><br/>
                    <button onClick={()=>saveBlog()} class="btn btn-primary form-control action-btn">Thêm/ Cập nhật bài viết</button>
                </div>
            </main>
        </div>
        </>
    );
}

export default AdminAddBlog;