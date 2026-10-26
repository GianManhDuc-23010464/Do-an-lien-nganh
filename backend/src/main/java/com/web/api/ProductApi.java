package com.web.api;

import com.web.dto.request.ProductRequest;
import com.web.dto.response.ProductResponse;
import com.web.entity.Product;
import com.web.enums.ProductStatus;
import com.web.mapper.ProductMapper;
import com.web.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/product")
public class ProductApi {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductMapper productMapper;

    @PostMapping("/admin/create")
    public ResponseEntity<?> save(@Valid @RequestBody ProductRequest productRequest, BindingResult bindingResult){
        if(bindingResult.hasErrors()){
            return new ResponseEntity<>(bindingResult.getAllErrors(), HttpStatus.BAD_REQUEST);
        }
        ProductResponse response = productService.save(productRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/admin/update")
    public ResponseEntity<?> update(@Valid @RequestBody ProductRequest productRequest, BindingResult bindingResult){
        if(bindingResult.hasErrors()){
            return new ResponseEntity<>(bindingResult.getAllErrors(), HttpStatus.BAD_REQUEST);
        }
        ProductResponse response = productService.update(productRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    @DeleteMapping("/admin/delete")
    public ResponseEntity<?> delete(@RequestParam("id") Long id){
        productService.delete(id);
        return new ResponseEntity<>("delete success", HttpStatus.OK);
    }

    @GetMapping("/admin/findById")
    public ResponseEntity<?> findByIdForAdmin(@RequestParam("id") Long id){
        ProductResponse response = productService.findByIdForAdmin(id);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /** Ẩn/hiện sản phẩm. status = ACTIVE (đang bán) hoặc HIDDEN (ẩn). */
    @PostMapping("/admin/set-status")
    public ResponseEntity<?> setStatus(@RequestParam("id") Long id, @RequestParam("status") ProductStatus status){
        ProductResponse response = productService.setStatus(id, status);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /** Danh sách sản phẩm cho admin (thấy cả hàng ẩn), lọc theo tab trạng thái. */
    @PostMapping("/admin/search")
    public ResponseEntity<?> searchAdmin(@RequestParam(value = "keyword", required = false) String keyword,
                                         @RequestParam(value = "status", required = false) String status,
                                         @RequestParam(value = "smallPrice", required = false) Double smallPrice,
                                         @RequestParam(value = "largePrice", required = false) Double largePrice,
                                         @RequestBody(required = false) List<Long> listIdCategory, Pageable pageable){
        Page<ProductResponse> response = productService.searchFullAdmin(keyword, status, smallPrice, largePrice, listIdCategory, pageable);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/public/findById")
    public ResponseEntity<?> findByIdForUser(@RequestParam("id") Long id){
        ProductResponse response = productService.findByIdForUser(id);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/findByParam")
    public ResponseEntity<?> findByParam(@RequestParam("q") String params, Pageable pageable){
        Page<ProductResponse> response = productService.search(params, pageable);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/findByCategory")
    public ResponseEntity<?> findByParam(@RequestParam("idCategory") Long id, Pageable pageable){
        Page<ProductResponse> response = productService.findByCategory(id, pageable);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/findAll")
    public ResponseEntity<?> findAll(Pageable pageable){
        Page<ProductResponse> response = productService.findAll(pageable);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/findAll-list")
    public ResponseEntity<?> findAllList(){
        List<ProductResponse> response = productService.findAllList();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/public/searchFull")
    public ResponseEntity<?> searchFull(@RequestParam(value = "keyword", required = false) String keyword,
                                        @RequestParam(value = "onSale", required = false) Boolean onSale,
                                        @RequestParam(value = "smallPrice", required = false) Double smallPrice,
                                        @RequestParam(value = "largePrice", required = false) Double largePrice,
                                        @RequestBody(required = false) List<Long> listIdCategory, Pageable pageable){
        Page<ProductResponse> response = productService.searchFullProduct(keyword, onSale, smallPrice, largePrice, listIdCategory, pageable);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
