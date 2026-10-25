package com.web.dto.response;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.web.entity.ProductCategory;
import com.web.entity.ProductColor;
import com.web.entity.ProductImage;
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

    private String description;

    private Date createdDate;

    private Time createdTime;

    private Integer quantitySold;

    private List<ProductColor> productColors = new ArrayList<>();

    private List<ProductCategory> productCategories = new ArrayList<>();

    private List<ProductImage> productImages = new ArrayList<>();
}
