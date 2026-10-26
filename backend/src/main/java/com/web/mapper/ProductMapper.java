package com.web.mapper;

import com.web.dto.request.CategoryRequest;
import com.web.dto.request.ProductRequest;
import com.web.dto.response.ProductResponse;
import com.web.dto.response.UserDto;
import com.web.entity.Category;
import com.web.entity.Product;
import com.web.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    @Autowired
    private ModelMapper mapper;

    public ProductResponse productToProResponse(Product product){
        ProductResponse response = mapper.map(product, ProductResponse.class);
        enrich(product, response);
        return response;
    }

    private void enrich(Product product, ProductResponse response) {
        double sum = 0;
        int count = 0;
        if (product.getProductComments() != null) {
            for (com.web.entity.ProductComment c : product.getProductComments()) {
                if (c.getStar() != null) {
                    sum += c.getStar();
                    count++;
                }
            }
        }
        response.setReviewCount(count);
        response.setAvgStar(count == 0 ? 0D : Math.round(sum / count * 10) / 10.0);
        int stock = 0;
        boolean lowStock = false;
        if (product.getProductColors() != null) {
            for (com.web.entity.ProductColor color : product.getProductColors()) {
                if (color.getProductSizes() == null) continue;
                for (com.web.entity.ProductSize size : color.getProductSizes()) {
                    int qty = size.getQuantity() == null ? 0 : size.getQuantity();
                    stock += qty;
                    int threshold = size.getLowStockThreshold() == null ? DEFAULT_LOW_STOCK : size.getLowStockThreshold();
                    if (qty > 0 && qty <= threshold) {
                        lowStock = true;
                    }
                }
            }
        }
        response.setStock(stock);
        response.setLowStock(lowStock);
        // Trạng thái hiển thị: HIDDEN giữ nguyên, còn lại suy ra theo tồn kho.
        if (com.web.enums.ProductStatus.HIDDEN.equals(product.getStatus())) {
            response.setStatus(com.web.enums.ProductStatus.HIDDEN);
        } else {
            response.setStatus(stock == 0 ? com.web.enums.ProductStatus.OUT_OF_STOCK
                    : com.web.enums.ProductStatus.ACTIVE);
        }
    }

    /** Ngưỡng cảnh báo sắp hết hàng mặc định khi biến thể không đặt riêng. */
    public static final int DEFAULT_LOW_STOCK = 5;

    public Product productRequestToProduct(ProductRequest productRequest){
        Product product = mapper.map(productRequest, Product.class);
        return product;
    }

    public List<ProductResponse> listProductToProResponse(List<Product> list){
        List<ProductResponse> responses = list.stream().map(this::productToProResponse)
                .collect(Collectors.toList());
        return responses;
    }
}
