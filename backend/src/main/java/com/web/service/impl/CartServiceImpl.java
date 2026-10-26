package com.web.service.impl;

import com.web.dto.request.CartRequest;
import com.web.dto.response.CartItemResponse;
import com.web.entity.CartItem;
import com.web.entity.ProductSize;
import com.web.entity.User;
import com.web.exception.MessageException;
import com.web.repository.CartItemRepository;
import com.web.repository.ProductSizeRepository;
import com.web.service.CartService;
import com.web.service.ProductService;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductSizeRepository productSizeRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserUtils userUtils;

    private User currentUser() {
        User user = userUtils.getUserWithAuthority();
        if (user == null) {
            throw new MessageException("Bạn cần đăng nhập");
        }
        return user;
    }

    @Override
    public List<CartItemResponse> getMyCart() {
        User user = currentUser();
        List<CartItemResponse> result = new ArrayList<>();
        for (CartItem item : cartItemRepository.findByUserId(user.getId())) {
            result.add(toResponse(item));
        }
        return result;
    }

    @Override
    public Long countMyCart() {
        return cartItemRepository.countByUserId(currentUser().getId());
    }

    @Override
    public void addToCart(CartRequest request) {
        User user = currentUser();
        ProductSize productSize = validate(request);
        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductSizeId(user.getId(), request.getProductSizeId());
        CartItem item = existing.orElseGet(() -> {
            CartItem newItem = new CartItem();
            newItem.setUser(user);
            newItem.setProductSize(productSize);
            newItem.setQuantity(0);
            return newItem;
        });
        int newQuantity = item.getQuantity() + request.getQuantity();
        if (newQuantity > productSize.getQuantity()) {
            throw new MessageException("Số lượng vượt quá tồn kho");
        }
        item.setQuantity(newQuantity);
        cartItemRepository.save(item);
    }

    @Override
    public void updateQuantity(CartRequest request) {
        User user = currentUser();
        ProductSize productSize = validate(request);
        CartItem item = cartItemRepository.findByUserIdAndProductSizeId(user.getId(), request.getProductSizeId())
                .orElseThrow(() -> new MessageException("Sản phẩm không có trong giỏ hàng"));
        if (request.getQuantity() > productSize.getQuantity()) {
            throw new MessageException("Số lượng vượt quá tồn kho");
        }
        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
    }

    @Override
    public void removeItem(Long productSizeId) {
        cartItemRepository.deleteByUserIdAndProductSizeId(currentUser().getId(), productSizeId);
    }

    @Override
    public void clearCart() {
        cartItemRepository.deleteByUserId(currentUser().getId());
    }

    private ProductSize validate(CartRequest request) {
        if (request.getProductSizeId() == null) {
            throw new MessageException("Thiếu id sản phẩm");
        }
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new MessageException("Số lượng phải lớn hơn 0");
        }
        return productSizeRepository.findById(request.getProductSizeId())
                .orElseThrow(() -> new MessageException("Sản phẩm không tồn tại"));
    }

    private CartItemResponse toResponse(CartItem item) {
        ProductSize size = item.getProductSize();
        CartItemResponse response = new CartItemResponse();
        response.setSize(size);
        response.setColor(size.getProductColor());
        response.setProduct(productService.findByIdForUser(size.getProductColor().getProduct().getId()));
        response.setQuantity(item.getQuantity());
        return response;
    }
}
