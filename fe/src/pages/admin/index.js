import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import {getMethod,postMethodPayload, deleteMethod} from '../../services/request';
import {formatMoney} from '../../services/money';
import Chart from "chart.js/auto";



const AdminIndex = ()=>{
    const [items, setItems] = useState([]);
    const [doanhThuThang, setdoanhThuThang] = useState(0);
    const [soQuanTri, setsoQuanTri] = useState(0);
    const [soMatHangHienCo, setsoMatHangHienCo] = useState(0);
    const [doanhThuNgay, setdoanhThuNgay] = useState(0);
    const [soDonNgay, setsoDonNgay] = useState(0);
    useEffect(()=>{
        getGiaTri();
        revenueYear(1999)
    }, []);

    const getGiaTri = async() =>{
        var response = await getMethod('/api/statistic/admin/revenue-this-month')
        var result = await response.text();
        setdoanhThuThang(result)
        var response = await getMethod('/api/statistic/admin/number-admin')
        var result = await response.text();
        setsoQuanTri(result)
        var response = await getMethod('/api/statistic/admin/number-product')
        var result = await response.text();
        setsoMatHangHienCo(result)
        var response = await getMethod('/api/statistic/admin/revenue-today')
        var result = await response.text();
        setdoanhThuNgay(result)
        var response = await getMethod('/api/statistic/admin/number-invoice-today-finish')
        var result = await response.text();
        setsoDonNgay(result)
    };

    async function revenueYear(nam) {
        if (nam < 2000) {
            nam = new Date().getFullYear()
        }
        var url = 'http://localhost:8080/api/statistic/admin/revenue-year?year=' + nam;
        const response = await getMethod(url)
        var list = await response.json();
        var main = '';
        for (var i = 0; i < list.length; i++) {
            if (list[i] == null) {
                list[i] = 0
            }
        }
    
    
        var lb = 'doanh thu năm ' + nam;
        document.getElementById("canvas").innerHTML = `<canvas id="chart"></canvas>`
        const ctx = document.getElementById("chart").getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["tháng 1", "tháng 2", "tháng 3", "tháng 4",
                    "tháng 5", "tháng 6", "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"
                ],
                datasets: [{
                    label: lb,
                    backgroundColor: 'rgba(161, 198, 247, 1)',
                    borderColor: 'rgb(47, 128, 237)',
                    data: list,
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function(value) {
                                return formatMoney(value);
                            }
                        }
                    }]
                }
            },
        });
    }
    
    function loadByNam() {
        var nam = document.getElementById("nams").value;
        revenueYear(nam);
    }
    

    
    return (
        <>
            <div class="thongke">
                <div class="row">
                    <div class="col-md-4">
                        <div class="thongke1">
                            <div class="texts">Doanh thu tháng này (VND)</div>
                            <div>
                            </div>
                            <div class="soluong">
                                <b id="doanhThu">{formatMoney(doanhThuThang)}</b>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="thongke2">
                            <div class="texts">Số lượng quản trị</div>
                            <div>
                            </div>
                            <div class="soluong">
                                <b id="soLuongNV">{soQuanTri}</b>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="thongke3">
                            <div class="texts">Số lượng mặt hàng hiện có</div>
                            <div>
                            </div>
                            <div class="soluong">
                                <b id="soLuongMH">{soMatHangHienCo}</b>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="thongke4">
                            <div class="texts">Doanh thu trong ngày (VND)</div>
                            <div>
                            </div>
                            <div class="soluong">
                                <b id="doanhThuNgay">{formatMoney(doanhThuNgay)}</b>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="thongke5">
                            <div class="texts">Số đơn hàng hoàn thành trong ngày</div>
                            <div>
                            </div>
                            <div class="soluong">
                                <b id="donhoanthanh">{soDonNgay}</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <br/><br/>
            <div class="col-sm-12 header-sp row ">
                <div class="col-md-3">
                    <p class="loctheongay">Chọn năm cần xem</p>
                    <select id="nams" class="form-control">
                    <option id="2023">2023</option>
                    <option id="2024">2024</option>
                    <option id="2025">2025</option>
                    <option id="2026">2026</option>
                    <option id="2027">2027</option>
                    <option id="2028">2028</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <p class="loctheongay" dangerouslySetInnerHTML={{__html:'&ThinSpace;'}}></p>
                    <button onClick={()=>loadByNam()} class="btn btn-primary form-control"><i class="fa fa-filter"></i> Lọc</button>
                </div>
            </div>
            <div class="col-sm-12 divtale">
                <div class="card chart-container divtale" id='canvas'>
                    <canvas id="chart"></canvas>
                </div>
            </div>
        </>
    );
}

export default AdminIndex;