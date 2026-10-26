package com.web.service.impl;

import com.web.dto.request.ColorRequest;
import com.web.dto.request.ProductRequest;
import com.web.dto.request.SizeRequest;
import com.web.dto.response.ProductResponse;
import com.web.entity.*;
import com.web.exception.MessageException;
import com.web.mapper.ProductMapper;
import com.web.repository.*;
import com.web.service.ProductService;
import com.web.utils.CharacterUtils;
import com.web.service.CloudinaryService;
import com.web.utils.CommonPage;
import com.web.utils.FindByImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.io.File;
import java.io.IOException;
import java.math.BigInteger;
import java.sql.Date;
import java.sql.Time;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@Repository
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository productCategoryRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private ProductColorRepository productColorRepository;

    @Autowired
    private ProductSizeRepository productSizeRepository;

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @Autowired
    private ImportProductRepository importProductRepository;

    @Autowired
    private CommonPage commonPage;

    @Autowired
    EntityManager em;

    @Override
    public ProductResponse save(ProductRequest productRequest) {
        Product product = productMapper.productRequestToProduct(productRequest);
        if(product.getId() != null){
            throw new MessageException("id must null");
        }
        product.setCreatedDate(new Date(System.currentTimeMillis()));
        product.setCreatedTime(new Time(System.currentTimeMillis()));
        product.setQuantitySold(0);
        if (product.getAlias() == null) {
            product.setAlias(CharacterUtils.change(product.getName()));
        }
        if(product.getAlias() == ""){
            product.setAlias(CharacterUtils.change(product.getName()));
        }
        Product result = productRepository.save(product);

        for(Long id : productRequest.getListCategoryIds()){
            ProductCategory productCategory = new ProductCategory();
            productCategory.setProduct(result);
            Category category = new Category();
            category.setId(id);
            productCategory.setCategory(category);
            productCategoryRepository.save(productCategory);
        }

        for(String link : productRequest.getLinkLinkImages()){
            ProductImage productImage = new ProductImage();
            productImage.setProduct(result);
            productImage.setLinkImage(link);
            productImageRepository.save(productImage);
        }

        for(ColorRequest color : productRequest.getColors()){
            ProductColor productColor = new ProductColor();
            productColor.setProduct(result);
            productColor.setColorName(color.getColorName());
            productColor.setLinkImage(color.getLinkImage());
            ProductColor colorResult = productColorRepository.save(productColor);
            for(SizeRequest size : color.getSize()){
                ProductSize productSize = new ProductSize();
                productSize.setProductColor(colorResult);
                productSize.setSizeName(size.getSizeName());
                productSize.setQuantity(size.getQuantity());
                productSizeRepository.save(productSize);
            }
        }
        ProductResponse response = productMapper.productToProResponse(productRepository.findById(result.getId()).get());
        return response;
    }

    @Override
    public ProductResponse update(ProductRequest productRequest) {
        Product product = productMapper.productRequestToProduct(productRequest);
        if(product.getId() == null){
            throw new MessageException("id product require");
        }
        Optional<Product> exist = productRepository.findById(product.getId());
        if(exist.isEmpty()){
            throw new MessageException("product not found");
        }

        product.setCreatedDate(exist.get().getCreatedDate());
        product.setCreatedTime(exist.get().getCreatedTime());
        product.setQuantitySold(exist.get().getQuantitySold());
        if (product.getAlias() == null) {
            product.setAlias(CharacterUtils.change(product.getName()));
        }
        if(product.getAlias() == ""){
            product.setAlias(CharacterUtils.change(product.getName()));
        }
        Product result = productRepository.save(product);

        productCategoryRepository.deleteByProduct(result.getId());
        for(Long id : productRequest.getListCategoryIds()){
            ProductCategory productCategory = new ProductCategory();
            productCategory.setProduct(result);
            Category category = new Category();
            category.setId(id);
            productCategory.setCategory(category);
            productCategoryRepository.save(productCategory);
        }
        for(String link : productRequest.getLinkLinkImages()){
            ProductImage productImage = new ProductImage();
            productImage.setProduct(result);
            productImage.setLinkImage(link);
            productImageRepository.save(productImage);
        }
        for(ColorRequest color : productRequest.getColors()){
            ProductColor productColor = new ProductColor();
            productColor.setId(color.getId());
            productColor.setProduct(result);
            productColor.setColorName(color.getColorName());
            productColor.setLinkImage(color.getLinkImage());
            if(color.getLinkImage() == null){
                if(color.getId() != null){
                    Optional<ProductColor> ex = productColorRepository.findById(color.getId());
                    if(ex.isPresent()){
                        productColor.setLinkImage(ex.get().getLinkImage());
                    }
                }
            }
            ProductColor colorResult = productColorRepository.save(productColor);
            for(SizeRequest size : color.getSize()){
                ProductSize productSize = new ProductSize();
                productSize.setId(size.getId());
                productSize.setProductColor(colorResult);
                productSize.setSizeName(size.getSizeName());
                productSize.setQuantity(size.getQuantity());
                productSizeRepository.save(productSize);
            }
        }
        ProductResponse response = productMapper.productToProResponse(productRepository.findById(result.getId()).get());
        return response;
    }

    @Override
    public ProductResponse delete(Long idProduct) {
        Optional<Product> exist = productRepository.findById(idProduct);
        if(exist.isEmpty()){
            throw new MessageException("product not found");
        }
        if(invoiceDetailRepository.countByProduct(idProduct) > 0){
            productColorRepository.setNull(idProduct);
            productRepository.delete(exist.get());
        }
        else{
            importProductRepository.deleteByProduct(idProduct);
            productSizeRepository.deleteByProduct(idProduct);
            productRepository.delete(exist.get());
        }
        return null;
    }

    @Override
    public Page<ProductResponse> findAll(Pageable pageable) {
        Page<Product> products = productRepository.findAll(pageable);
        List<ProductResponse> list = productMapper.listProductToProResponse(products.getContent());
        Page<ProductResponse> page = commonPage.restPage(products,list);
        return page;
    }

    @Override
    public List<ProductResponse> findAllList() {
        List<Product> products = productRepository.findAll();
        List<ProductResponse> list = productMapper.listProductToProResponse(products);
        return list;
    }

    @Override
    public Page<ProductResponse> search(String param, Pageable pageable) {
        Page<Product> products = productRepository.findAllByParam("%"+param+"%",pageable);
        List<ProductResponse> list = productMapper.listProductToProResponse(products.getContent());
        Page<ProductResponse> page = commonPage.restPage(products,list);
        return page;
    }

    @Override
    public Page<ProductResponse> findByCategory(Long idCategory, Pageable pageable) {
        Page<Product> products = productRepository.findByCategory(idCategory,pageable);
        List<ProductResponse> list = productMapper.listProductToProResponse(products.getContent());
        Page<ProductResponse> page = commonPage.restPage(products,list);
        return page;
    }

    @Override
    public Page<ProductResponse> searchFull(Double smallPrice, Double largePrice, List<Long> listIdCategory, Pageable pageable) {
        return null;
    }

    /** Cột được phép sắp xếp (tránh SQL injection qua tham số sort). */
    private static final java.util.Map<String, String> SORTABLE = java.util.Map.of(
            "id", "p.id", "price", "p.price", "name", "p.name",
            "quantitySold", "p.quantity_sold", "createdDate", "p.created_date");

    @Override
    public Page<ProductResponse> searchFullProduct(String keyword, Boolean onSale, Double smallPrice, Double largePrice, List<Long> listIdCategory, Pageable pageable) {
        if(smallPrice == null) smallPrice = 0D;
        if(largePrice == null) largePrice = 1000000000D;
        StringBuilder where = new StringBuilder(" from product p where p.price >= :minPrice and p.price <= :maxPrice ");
        boolean hasKeyword = keyword != null && !keyword.isBlank();
        if(hasKeyword){
            where.append(" and lower(p.name) like :keyword ");
        }
        if(Boolean.TRUE.equals(onSale)){
            where.append(" and p.old_price is not null and p.old_price > p.price ");
        }
        boolean hasCategory = listIdCategory != null && !listIdCategory.isEmpty();
        if(hasCategory){
            where.append(" and exists (select 1 from product_category pc where pc.product_id = p.id and pc.category_id in (:categories)) ");
        }
        StringBuilder order = new StringBuilder();
        for(Sort.Order o : pageable.getSort()){
            String column = SORTABLE.get(o.getProperty());
            if(column == null) continue;
            order.append(order.length() == 0 ? " order by " : ", ")
                    .append(column).append(o.isAscending() ? " asc" : " desc");
        }
        if(order.length() == 0){
            order.append(" order by p.id desc");
        }

        Query query = em.createNativeQuery("select p.*" + where + order, Product.class);
        Query queryCount = em.createNativeQuery("select count(*)" + where);
        for(Query q : List.of(query, queryCount)){
            q.setParameter("minPrice", smallPrice);
            q.setParameter("maxPrice", largePrice);
            if(hasKeyword) q.setParameter("keyword", "%" + keyword.trim().toLowerCase() + "%");
            if(hasCategory) q.setParameter("categories", listIdCategory);
        }
        query.setMaxResults(pageable.getPageSize());
        query.setFirstResult(pageable.getPageNumber() * pageable.getPageSize());
        @SuppressWarnings("unchecked")
        List<Product> list = query.getResultList();
        long total = ((Number) queryCount.getSingleResult()).longValue();
        Page<Product> page = new PageImpl<>(list, pageable, total);
        List<ProductResponse> productResponses = productMapper.listProductToProResponse(list);
        return commonPage.restPage(page,productResponses);
    }

    @Override
    public ProductResponse findByIdForAdmin(Long id) {
        Optional<Product> exist = productRepository.findById(id);
        if(exist.isEmpty()){
            throw new MessageException("product not found");
        }
        return productMapper.productToProResponse(exist.get());
    }

    @Override
    public ProductResponse findByIdForUser(Long id) {
        Optional<Product> exist = productRepository.findById(id);
        if(exist.isEmpty()){
            throw new MessageException("product not found");
        }
        return productMapper.productToProResponse(exist.get());
    }

    @Override
    public ProductResponse findByAlias(String alias) {
        Optional<Product> exist = productRepository.findByAlias(alias);
        if(exist.isEmpty()){
            throw new MessageException("product not found");
        }
        return productMapper.productToProResponse(exist.get());
    }


    @Autowired
    private FindByImage findByImage;

    @Autowired
    private CloudinaryService cloudinaryService;
    @Override
    public List<Product> findByImage(MultipartFile multipartFile) throws IOException {
        List<ProductImage> links = productImageRepository.findAll();
        List<Product> result = new ArrayList<>();
        List<Double> res = new ArrayList<>();
        File sr = File.createTempFile("search-", ".img");
        try {
            multipartFile.transferTo(sr);
            for(ProductImage p : links){
                res.add(findByImage.compare(p.getLinkImage(),sr));
            }
        } finally {
            sr.delete();
        }
        return result;
    }
}
