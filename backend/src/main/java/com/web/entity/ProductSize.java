package com.web.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "product_size")
@Getter
@Setter
public class ProductSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String sizeName;

    private Integer quantity;

    /** Mã SKU của biến thể màu–size (tùy chọn). */
    private String sku;

    /** Giá riêng của biến thể; để trống nghĩa là dùng giá sản phẩm. */
    private Double price;

    /** Ngưỡng cảnh báo sắp hết hàng; để trống coi như mặc định 5. */
    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;

    @ManyToOne
    @JoinColumn(name = "product_color_id")
    @JsonBackReference
    private ProductColor productColor;

    @OneToMany(mappedBy = "productSize", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ImportProduct> importProducts;

    /** Giá bán thực tế của biến thể: giá riêng nếu có, ngược lại lấy giá sản phẩm. */
    @JsonProperty("effectivePrice")
    public Double getEffectivePrice() {
        if (price != null) {
            return price;
        }
        if (productColor != null && productColor.getProduct() != null) {
            return productColor.getProduct().getPrice();
        }
        return null;
    }
}
