package com.web.api;

import com.web.repository.InvoiceRepository;
import com.web.repository.ProductRepository;
import com.web.repository.UserRepository;
import com.web.constants.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/statistic")
public class StatiticsApi {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/admin/revenue-this-month")
    public Double doanhThuThangNay(){
        Date date = new Date(System.currentTimeMillis());
        String[] str = date.toString().split("-");
        Integer year = Integer.valueOf(str[0]);
        Integer month = Integer.valueOf(str[1]);
        return invoiceRepository.calDt(month, year);
    }

    @GetMapping("/admin/revenue-today")
    public Double revenueByDate(){
        Date date = new Date(System.currentTimeMillis());
        return invoiceRepository.revenueByDate(date);
    }

    @GetMapping("/admin/number-invoice-today-finish")
    public Double numInvoiceToDay(){
        Date date = new Date(System.currentTimeMillis());
        return invoiceRepository.numInvoiceToDay(date);
    }

    @GetMapping("/admin/number-admin")
    public Double numberAdmin(){
        return userRepository.countAdmin(Constants.ROLE_ADMIN);
    }

    @GetMapping("/admin/number-product")
    public Long numberProduct(){
        return productRepository.count();
    }

    @Autowired
    private com.web.repository.ProductSizeRepository productSizeRepository;

    /** Số liệu tổng hợp cho trang Dashboard. */
    @GetMapping("/admin/dashboard")
    public java.util.Map<String, Object> dashboard(){
        Date today = new Date(System.currentTimeMillis());
        String[] str = today.toString().split("-");
        java.util.Map<String, Object> res = new java.util.LinkedHashMap<>();
        res.put("revenueToday", nz(invoiceRepository.revenueByDate(today)));
        res.put("revenueMonth", nz(invoiceRepository.calDt(Integer.valueOf(str[1]), Integer.valueOf(str[0]))));
        res.put("ordersPending", invoiceRepository.countByStatus(com.web.utils.StatusUtils.DANG_CHO_XAC_NHAN));
        res.put("ordersAwaitingPayment", invoiceRepository.countByStatus(com.web.utils.StatusUtils.CHO_THANH_TOAN));
        res.put("ordersShipping", invoiceRepository.countByStatus(com.web.utils.StatusUtils.DA_GUI));
        res.put("ordersDoneToday", nz(invoiceRepository.numInvoiceToDay(today)));
        res.put("totalProducts", productRepository.count());
        res.put("totalUsers", userRepository.count());
        List<java.util.Map<String, Object>> top = new ArrayList<>();
        for (com.web.entity.Product p : productRepository.findTop5ByOrderByQuantitySoldDesc()) {
            java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("image", p.getImageBanner());
            m.put("price", p.getPrice());
            m.put("sold", p.getQuantitySold() == null ? 0 : p.getQuantitySold());
            top.add(m);
        }
        res.put("topProducts", top);
        List<java.util.Map<String, Object>> low = new ArrayList<>();
        for (com.web.entity.ProductSize s : productSizeRepository.findLowStock(5, org.springframework.data.domain.PageRequest.of(0, 8))) {
            // Biến thể "mồ côi": sản phẩm đã xóa nhưng màu/size giữ lại cho đơn cũ -> bỏ qua.
            com.web.entity.Product p = s.getProductColor() == null ? null : s.getProductColor().getProduct();
            if (p == null) continue;
            java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("productSizeId", s.getId());
            m.put("productId", p.getId());
            m.put("productName", p.getName());
            m.put("color", s.getProductColor().getColorName());
            m.put("size", s.getSizeName());
            m.put("quantity", s.getQuantity());
            low.add(m);
        }
        res.put("lowStock", low);
        return res;
    }

    private static Double nz(Double d) {
        return d == null ? 0D : d;
    }

    @GetMapping("/admin/revenue-year")
    public List<Double> doanhThu(@RequestParam("year") Integer year){
        List<Double> list = new ArrayList<>();
        for(int i=1; i< 13; i++){
            Double sum = invoiceRepository.calDt(i, year);
            if(sum == null){
                sum = 0D;
            }
            list.add(sum);
        }
        return list;
    }
}
