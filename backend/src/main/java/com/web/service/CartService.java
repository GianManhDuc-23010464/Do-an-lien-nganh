package com.web.service;

import com.web.dto.request.CartRequest;
import com.web.dto.response.CartItemResponse;

import java.util.List;

public interface CartService {

    List<CartItemResponse> getMyCart();

    Long countMyCart();

    void addToCart(CartRequest request);

    void updateQuantity(CartRequest request);

    void removeItem(Long productSizeId);

    void clearCart();
}
