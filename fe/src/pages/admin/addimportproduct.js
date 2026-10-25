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


var description = '';


const AdminAddImport = ()=>{
    const editorRef = useRef(null);
    const [item, setItem] = useState(null);
    const [product, setProduct] = useState([]);
    const [selectproduct, setSelectProduct] = useState(null);
    const [color, setColor] = useState([]);
    const [selectcolor, setSelectColor] = useState(null);
    const [size, setSize] = useState([]);
    const [selectsize, setSelectSize] = useState(null);

    useEffect(()=>{
        const getData = async() =>{
            var uls = new URL(document.URL)
            var id = uls.searchParams.get("id");
            if(id != null){
                var response = await getMethod('/api/import-product/admin/findById?id='+id)
                var result = await response.json();
                setItem(result)
                console.log(result);
                
                description = result.description
            }
        };
        getData();
        getProduct();
    }, []);

    async function getProduct() {
        var response = await getMethod('/api/product/public/findAll-list')
        var result = await response.json();
        console.log(result);
        setProduct(result)
    }

    function getColor(option){
        setSelectProduct(option)
        setColor(option.productColors)
    }

    function getSize(option){
        setSelectColor(option)
        setSize((option.productSizes))
    }

    function handleEditorChange(content, editor) {
        description = content;
    }


    
async function saveData(event) {
    event.preventDefault();
    if(selectsize == null){
        toast.error("Hãy chọn kích thước sản phẩm");
        return;
    }
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var payload = {
        "id": id,
        "quantity": event.target.elements.soluong.value,
        "importPrice": event.target.elements.gianhap.value,
        "description": description,
        "productSize": {
            "id": selectsize.id
        }
    }
    var url = '/api/import-product/admin/create'
    if(id != null){
        url = '/api/import-product/admin/update'
    }
    const response = await postMethodPayload(url, payload)
    if (response.status < 300) {
        Swal.fire({
            title: "Thông báo",
            text: "Thành công!",
            preConfirm: () => {
                window.location.href = 'importproduct'
            }
        });
    } 
    else {
        if (response.status == 417) {
            var result = await response.json()
            toast.warning(result.defaultMessage);
        }
        else{
             toast.error("Thất bại");
        }
    }
}

    return (
        <>
         <div class="col-sm-12 header-sps">
            <div class="title-add-admin">
                <h4>Thêm/ cập nhật khuyến mại</h4>
            </div>
        </div>
        <div class="col-sm-12">
            <form onSubmit={saveData} class="main row">
                <div class="col-sm-5">
                    <label class="lb-form">sản phẩm</label>
                    <Select
                        options={product}
                        value={selectproduct}
                        onChange={getColor}
                        getOptionLabel={(option) => option.name} 
                        getOptionValue={(option) => option.id}    
                        closeMenuOnSelect={false}
                        placeholder="Chọn sản phẩm"
                    />
                    <label class="lb-form">Màu sắc</label>
                    <Select
                        options={color}
                        value={selectcolor}
                        onChange={getSize}
                        getOptionLabel={(option) => option.colorName} 
                        getOptionValue={(option) => option.id}    
                        closeMenuOnSelect={false}
                        placeholder="Chọn màu sắc"
                    />
                    <label class="lb-form">Kích thước</label>
                    <Select
                        options={size}
                        value={selectsize}
                        onChange={setSelectSize}
                        getOptionLabel={(option) => option.sizeName} 
                        getOptionValue={(option) => option.id}    
                        closeMenuOnSelect={false}
                        placeholder="Chọn kích thước"
                    />
                    <label class="lb-form">Số lượng</label>
                    <input defaultValue={item?.quantity} name="soluong" type="number" class="form-control"/>
                    <label class="lb-form">giá nhập</label>
                    <input defaultValue={item?.importPrice} name="gianhap" type="number" class="form-control"/><br/><br/>
                    <button onclick="saveImportPro()" class="btn btn-success form-control action-btn">Thêm/ Cập nhật đơn nhập</button>
                </div>
                <div class="col-sm-7">
                    <label class="lb-form">Mô tả</label>
                    <Editor name='editor' tinymceScriptSrc={'https://cdn.tiny.cloud/1/f6s0gxhkpepxkws8jawvfwtj0l9lv0xjgq1swbv4lgcy3au3/tinymce/6/tinymce.min.js'}
                                        onInit={(evt, editor) => editorRef.current = editor} 
                                        initialValue={item==null?'':item.description}
                                        onEditorChange={handleEditorChange}/>
                </div>
            </form>
        </div>
        </>
    );
}

export default AdminAddImport;