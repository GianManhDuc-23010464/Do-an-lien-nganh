package com.web.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.web.exception.MessageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    @Autowired
    private Cloudinary cloudinaryConfig;

    /** Upload thẳng từ bộ nhớ (không ghi file tạm ra đĩa), trả về link https. */
    public String uploadFile(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinaryConfig.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "image"));
            Object url = result.get("secure_url");
            if (url == null) url = result.get("url");
            return url == null ? null : url.toString();
        } catch (Exception e) {
            log.error("Cloudinary upload failed", e);
            throw new MessageException("Upload ảnh thất bại");
        }
    }
}
