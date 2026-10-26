package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartRequest {
    private Long productSizeId;
    private Integer quantity;
}
