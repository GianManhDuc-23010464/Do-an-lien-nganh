package com.web.dto.response;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.web.entity.ProductCategory;
import com.web.entity.ProductColor;
import com.web.entity.ProductImage;
import com.web.enums.ProductStatus;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;
import java.sql.Date;
import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class ProductResponse {

    private Long id;

    private String code;

    private String alias;

    private String name;

    private String imageBanner;

    private Double price;

    private Double oldPrice;

    /** Điểm đánh giá trung bình (0 nếu chưa có) và số lượt đánh giá. */
    private Double avgStar;

    private Integer reviewCount;

    /** Tổng tồn kho của mọi màu/size. */
    private Integer stock;

    /** Trạng thái hiển thị: ACTIVE / HIDDEN / OUT_OF_STOCK (suy ra khi stock = 0). */
    private ProductStatus status;

    /** Có ít nhất một biến thể còn hàng nhưng dưới ngưỡng cảnh báo. */
    private Boolean lowStock;

    private String description;

    private Date createdDate;

    private Time createdTime;

    private Integer quantitySold;

    private List<ProductColor> productColors = new ArrayList<>();

    private List<ProductCategory> productCategories = new ArrayList<>();

    private List<ProductImage> productImages = new ArrayList<>();
}
