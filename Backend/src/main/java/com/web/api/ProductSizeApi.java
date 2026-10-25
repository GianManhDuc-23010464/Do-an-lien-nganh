package com.web.api;

import com.web.entity.ProductSize;
import com.web.exception.MessageException;
import com.web.repository.InvoiceDetailRepository;
import com.web.repository.ProductColorRepository;
import com.web.repository.ProductSizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-size")
@CrossOrigin
public class ProductSizeApi {

    @Autowired
    private ProductSizeRepository productSizeRepository;

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @DeleteMapping("/admin/delete")
    public ResponseEntity<?> delete(@RequestParam("id") Long id){
        if(invoiceDetailRepository.countByProductSize(id) > 0){
            throw new MessageException("Size sản phẩm đã có người mua, không thể xóa");
        }
        productSizeRepository.deleteById(id);
        return new ResponseEntity<>("delete success", HttpStatus.OK);
    }


    @GetMapping("/public/find-by-product-color")
    public ResponseEntity<?> findByProColor(@RequestParam("idProColor") Long id){
        List<ProductSize> result = productSizeRepository.findByProductColor(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
