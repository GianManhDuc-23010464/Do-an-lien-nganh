package com.web.service.impl;

import com.web.dto.request.CartRequest;
import com.web.dto.response.CartItemResponse;
import com.web.dto.response.ProductResponse;
import com.web.entity.*;
import com.web.exception.MessageException;
import com.web.repository.CartItemRepository;
import com.web.repository.ProductSizeRepository;
import com.web.service.ProductService;
import com.web.utils.UserUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductSizeRepository productSizeRepository;
    @Mock private ProductService productService;
    @Mock private UserUtils userUtils;

    @InjectMocks private CartServiceImpl cartService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(7L);
    }

    @Test
    void addNewItemSavesWithRequestedQuantity() {
        when(userUtils.getUserWithAuthority()).thenReturn(user);
        when(productSizeRepository.findById(5L)).thenReturn(Optional.of(productSize(5L, 10)));
        when(cartItemRepository.findByUserIdAndProductSizeId(7L, 5L)).thenReturn(Optional.empty());

        cartService.addToCart(request(5L, 2));

        ArgumentCaptor<CartItem> captor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(captor.capture());
        assertEquals(2, captor.getValue().getQuantity());
        assertEquals(7L, captor.getValue().getUser().getId());
    }

    @Test
    void addExistingItemAccumulatesQuantity() {
        when(userUtils.getUserWithAuthority()).thenReturn(user);
        ProductSize size = productSize(5L, 10);
        when(productSizeRepository.findById(5L)).thenReturn(Optional.of(size));
        CartItem existing = new CartItem();
        existing.setUser(user);
        existing.setProductSize(size);
        existing.setQuantity(3);
        when(cartItemRepository.findByUserIdAndProductSizeId(7L, 5L)).thenReturn(Optional.of(existing));

        cartService.addToCart(request(5L, 2));

        ArgumentCaptor<CartItem> captor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(captor.capture());
        assertEquals(5, captor.getValue().getQuantity());
    }

    @Test
    void addRejectsWhenExceedingStock() {
        when(userUtils.getUserWithAuthority()).thenReturn(user);
        when(productSizeRepository.findById(5L)).thenReturn(Optional.of(productSize(5L, 3)));
        when(cartItemRepository.findByUserIdAndProductSizeId(7L, 5L)).thenReturn(Optional.empty());

        assertThrows(MessageException.class, () -> cartService.addToCart(request(5L, 4)));
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void addRejectsZeroQuantity() {
        when(userUtils.getUserWithAuthority()).thenReturn(user);

        assertThrows(MessageException.class, () -> cartService.addToCart(request(5L, 0)));
    }

    @Test
    void addRejectsWhenNotLoggedIn() {
        when(userUtils.getUserWithAuthority()).thenReturn(null);

        assertThrows(MessageException.class, () -> cartService.addToCart(request(5L, 1)));
    }

    @Test
    void updateReplacesQuantity() {
        when(userUtils.getUserWithAuthority()).thenReturn(user);
        ProductSize size = productSize(5L, 10);
        when(productSizeRepository.findById(5L)).thenReturn(Optional.of(size));
        CartItem existing = new CartItem();
        existing.setProductSize(size);
        existing.setQuantity(1);
        when(cartItemRepository.findByUserIdAndProductSizeId(7L, 5L)).thenReturn(Optional.of(existing));

        cartService.updateQuantity(request(5L, 8));

        assertEquals(8, existing.getQuantity());
        verify(cartItemRepository).save(existing);
    }

    @Test
    void removeDelegatesToRepository() {
        when(userUtils.getUserWithAuthority()).thenReturn(user);

        cartService.removeItem(5L);

        verify(cartItemRepository).deleteByUserIdAndProductSizeId(7L, 5L);
    }

    @Test
    void getMyCartBuildsResponseShape() {
        when(userUtils.getUserWithAuthority()).thenReturn(user);
        ProductSize size = productSize(5L, 10);
        CartItem item = new CartItem();
        item.setProductSize(size);
        item.setQuantity(4);
        when(cartItemRepository.findByUserId(7L)).thenReturn(List.of(item));
        ProductResponse product = new ProductResponse();
        product.setId(99L);
        when(productService.findByIdForUser(99L)).thenReturn(product);

        List<CartItemResponse> result = cartService.getMyCart();

        assertEquals(1, result.size());
        assertEquals(4, result.get(0).getQuantity());
        assertEquals(5L, result.get(0).getSize().getId());
        assertEquals("Đỏ", result.get(0).getColor().getColorName());
        assertEquals(99L, result.get(0).getProduct().getId());
    }

    private static ProductSize productSize(Long id, int stock) {
        Product product = new Product();
        product.setId(99L);
        ProductColor color = new ProductColor();
        color.setId(3L);
        color.setColorName("Đỏ");
        color.setProduct(product);
        ProductSize size = new ProductSize();
        size.setId(id);
        size.setSizeName("M");
        size.setQuantity(stock);
        size.setProductColor(color);
        return size;
    }

    private static CartRequest request(Long productSizeId, int quantity) {
        CartRequest request = new CartRequest();
        request.setProductSizeId(productSizeId);
        request.setQuantity(quantity);
        return request;
    }
}
