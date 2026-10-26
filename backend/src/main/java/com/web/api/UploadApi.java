package com.web.api;

import com.web.dto.response.UploadResponse;
import com.web.exception.MessageException;
import com.web.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/** Upload ảnh lên Cloudinary. Chỉ người đã đăng nhập mới được gọi (xem WebSecurityConfig). */
@RestController
@RequestMapping("/api/upload")
public class UploadApi {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private static final int MAX_FILES = 10;

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/file")
    public String uploadFile(@RequestParam("file") MultipartFile file){
        return upload(file);
    }

    @PostMapping("/multiple-file")
    public List<String> uploadFiles(@RequestParam("file") List<MultipartFile> files){
        checkCount(files);
        List<String> list = new ArrayList<>();
        for (MultipartFile f : files) {
            list.add(upload(f));
        }
        return list;
    }

    @PostMapping("/multiple-file-order-response")
    public List<UploadResponse> uploadFilesOrdered(@RequestParam("file") List<MultipartFile> files){
        checkCount(files);
        List<UploadResponse> list = new ArrayList<>();
        for (int i = 0; i < files.size(); i++) {
            UploadResponse obj = new UploadResponse();
            obj.setId(i);
            obj.setLink(upload(files.get(i)));
            list.add(obj);
        }
        return list;
    }

    private String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new MessageException("File trống");
        }
        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new MessageException("Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF");
        }
        String url = cloudinaryService.uploadFile(file);
        if (url == null) {
            throw new MessageException("Upload ảnh thất bại");
        }
        return url;
    }

    private static void checkCount(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new MessageException("Chưa chọn ảnh");
        }
        if (files.size() > MAX_FILES) {
            throw new MessageException("Tối đa " + MAX_FILES + " ảnh mỗi lần");
        }
    }
}
