package com.web.service.impl;

import com.web.dto.request.CommentRequest;
import com.web.dto.response.ProductCommentResponse;
import com.web.entity.Product;
import com.web.entity.ProductComment;
import com.web.entity.ProductCommentImage;
import com.web.exception.MessageException;
import com.web.mapper.ProductCommentMapper;
import com.web.repository.ProductCommentImageRepository;
import com.web.repository.ProductCommentRepository;
import com.web.service.ProductCommentService;
import com.web.repository.InvoiceDetailRepository;
import com.web.utils.StatusUtils;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.sql.Time;
import java.util.List;
import java.util.Optional;

@Component
public class ProductCommentServiceImpl implements ProductCommentService {

    @Autowired
    private ProductCommentRepository productCommentRepository;

    @Autowired
    private ProductCommentMapper productCommentMapper;

    @Autowired
    private ProductCommentImageRepository productCommentImageRepository;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    /** Chỉ người đã nhận được hàng mới được đánh giá sản phẩm. */
    @Override
    public boolean canReview(Long productId) {
        com.web.entity.User user = userUtils.getUserWithAuthority();
        if (user == null || productId == null) return false;
        Long n = invoiceDetailRepository.countReceivedByUserAndProduct(user.getId(), productId, StatusUtils.DA_NHAN);
        return n != null && n > 0;
    }

    @Override
    public ProductCommentResponse create(CommentRequest commentRequest) {
        if(commentRequest.getId() != null){
           throw new MessageException("id must null");
        }
        if(commentRequest.getProduct() == null || commentRequest.getProduct().getId() == null){
            throw new MessageException("product require");
        }
        if(commentRequest.getStar() == null || commentRequest.getStar() < 1 || commentRequest.getStar() > 5){
            throw new MessageException("Vui lòng chọn số sao từ 1 đến 5");
        }
        if(commentRequest.getContent() == null || commentRequest.getContent().isBlank()){
            throw new MessageException("Vui lòng nhập nội dung đánh giá");
        }
        if(!canReview(commentRequest.getProduct().getId())){
            throw new MessageException("Bạn cần mua và nhận sản phẩm này trước khi đánh giá");
        }
        ProductComment productComment = productCommentMapper.productCmtRequestToProductComment(commentRequest);
        productComment.setCreatedDate(new Date(System.currentTimeMillis()));
        productComment.setCreatedTime(new Time(System.currentTimeMillis()));
        productComment.setUser(userUtils.getUserWithAuthority());
        ProductComment result = productCommentRepository.save(productComment);
        for(String s : commentRequest.getListLink()){
            ProductCommentImage image = new ProductCommentImage();
            image.setProductComment(result);
            image.setLinkImage(s);
            productCommentImageRepository.save(image);
        }
        ProductCommentResponse response = productCommentMapper.productCmtToProductCommentRes(result);
        response.setIsMyComment(true);
        return response;
    }

    @Override
    public ProductCommentResponse update(CommentRequest commentRequest) {
        if(commentRequest.getId() == null){
            throw new MessageException("id require");
        }
        Optional<ProductComment> optional = productCommentRepository.findById(commentRequest.getId());
        if(optional.isEmpty()){
            throw new MessageException("comment not found");
        }
        if(!java.util.Objects.equals(optional.get().getUser().getId(), userUtils.getUserWithAuthority().getId())){
            throw new MessageException("access denied");
        }
        ProductComment productComment = productCommentMapper.productCmtRequestToProductComment(commentRequest);
        productComment.setCreatedDate(new Date(System.currentTimeMillis()));
        productComment.setCreatedTime(new Time(System.currentTimeMillis()));
        productComment.setUser(userUtils.getUserWithAuthority());
        productComment.setProduct(optional.get().getProduct());

        ProductComment result = productCommentRepository.save(productComment);
        for(String s : commentRequest.getListLink()){
            ProductCommentImage image = new ProductCommentImage();
            image.setProductComment(result);
            image.setLinkImage(s);
            productCommentImageRepository.save(image);
        }
        ProductCommentResponse response = productCommentMapper.productCmtToProductCommentRes(result);
        response.setIsMyComment(true);
        return response;
    }

    @Override
    public void delete(Long id) {
        if(id == null){
            throw new MessageException("id require");
        }
        Optional<ProductComment> optional = productCommentRepository.findById(id);
        if(optional.isEmpty()){
            throw new MessageException("comment not found");
        }
        if(!java.util.Objects.equals(optional.get().getUser().getId(), userUtils.getUserWithAuthority().getId())){
            throw new MessageException("access denied");
        }
        productCommentRepository.deleteById(id);
    }

    @Override
    public ProductCommentResponse findById(Long productId) {
        if(productId == null){
            throw new MessageException("id require");
        }
        Optional<ProductComment> optional = productCommentRepository.findById(productId);
        if(optional.isEmpty()){
            throw new MessageException("comment not found");
        }
        if(!java.util.Objects.equals(optional.get().getUser().getId(), userUtils.getUserWithAuthority().getId())){
            throw new MessageException("access denied");
        }
        return productCommentMapper.productCmtToProductCommentRes(optional.get());
    }

    @Override
    public List<ProductCommentResponse> findByProductId(Long productId) {
        List<ProductComment> list = productCommentRepository.findByProductId(productId);
        List<ProductCommentResponse> responses = productCommentMapper.listProductCmtToProCommentResponse(list);
        return responses;
    }
}
