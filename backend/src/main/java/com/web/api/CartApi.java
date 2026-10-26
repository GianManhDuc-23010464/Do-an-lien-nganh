package com.web.api;

import com.web.dto.request.CartRequest;
import com.web.dto.response.CartItemResponse;
import com.web.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartApi {

    @Autowired
    private CartService cartService;

    @GetMapping("/user/my-cart")
    public List<CartItemResponse> myCart() {
        return cartService.getMyCart();
    }

    @GetMapping("/user/count")
    public Long count() {
        return cartService.countMyCart();
    }

    @PostMapping("/user/add")
    public ResponseEntity<?> add(@RequestBody CartRequest request) {
        cartService.addToCart(request);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/user/update")
    public ResponseEntity<?> update(@RequestBody CartRequest request) {
        cartService.updateQuantity(request);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/user/remove")
    public ResponseEntity<?> remove(@RequestParam("productSizeId") Long productSizeId) {
        cartService.removeItem(productSizeId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/user/clear")
    public ResponseEntity<?> clear() {
        cartService.clearCart();
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
