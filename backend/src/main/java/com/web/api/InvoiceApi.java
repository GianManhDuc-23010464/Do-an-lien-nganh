package com.web.api;

import com.web.dto.request.InvoiceRequest;
import com.web.dto.request.PaymentReturnRequest;
import com.web.dto.response.InvoiceResponse;
import com.web.enums.PayType;
import com.web.service.InvoiceService;
import com.web.utils.RequestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping("/api/invoice")
public class InvoiceApi {

    @Autowired
    private InvoiceService invoiceService;

    /** Đặt hàng. Đơn online trả về paymentUrl để frontend chuyển khách sang cổng thanh toán. */
    @PostMapping("/user/create")
    public ResponseEntity<?> save(@RequestBody InvoiceRequest invoiceRequest, HttpServletRequest request){
        InvoiceResponse result = invoiceService.create(invoiceRequest, RequestUtils.clientIp(request));
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping("/user/retry-payment")
    public ResponseEntity<?> retryPayment(@RequestParam("idInvoice") Long idInvoice,
                                          @RequestParam("returnUrl") String returnUrl, HttpServletRequest request){
        return ResponseEntity.ok(invoiceService.retryPayment(idInvoice, returnUrl, RequestUtils.clientIp(request)));
    }

    /** Trang kết quả thanh toán gửi query string VNPay hoặc orderId MoMo lên để xác minh. */
    @PostMapping("/user/payment-return")
    public ResponseEntity<?> paymentReturn(@RequestBody PaymentReturnRequest paymentReturnRequest){
        return ResponseEntity.ok(invoiceService.confirmPaymentReturn(paymentReturnRequest));
    }

    @PostMapping("/admin/update-status")
    public ResponseEntity<?> updateStatus(@RequestParam("idInvoice") Long idInvoice, @RequestParam("idStatus") Long idStatus){
        InvoiceResponse result = invoiceService.updateStatus(idInvoice, idStatus);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/user/cancel-invoice")
    public ResponseEntity<?> cancelInvoice(@RequestParam("idInvoice") Long idInvoice){
        InvoiceResponse result = invoiceService.cancelInvoice(idInvoice);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/user/confirm-received")
    public ResponseEntity<?> confirmReceived(@RequestParam("idInvoice") Long idInvoice){
        return ResponseEntity.ok(invoiceService.confirmReceived(idInvoice));
    }

    @GetMapping("/user/find-by-user")
    public ResponseEntity<?> findByUser(){
        List<InvoiceResponse> result = invoiceService.findByUser();
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/admin/find-all")
    public ResponseEntity<?> findAll(@RequestParam(value = "from",required = false) Date from,
                                     @RequestParam(value = "to",required = false) Date to,
                                     @RequestParam(value = "paytype",required = false) PayType payType,
                                     @RequestParam(value = "status",required = false) Long statusId, Pageable pageable){
        Page<InvoiceResponse> result = invoiceService.findAllFull(from, to,payType, statusId,pageable);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/admin/find-all-by-date")
    public ResponseEntity<?> findAllByDate(@RequestParam(value = "from",required = false) Date from,
                                     @RequestParam(value = "to",required = false) Date to, Pageable pageable){
        Page<InvoiceResponse> result = invoiceService.findAll(from, to,pageable);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/user/find-by-id")
    public ResponseEntity<?> findByUser(@RequestParam("idInvoice") Long idInvoice){
        InvoiceResponse result = invoiceService.findById(idInvoice);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/admin/find-by-id")
    public ResponseEntity<?> findByAdmin(@RequestParam("idInvoice") Long idInvoice){
        InvoiceResponse result = invoiceService.findByIdForAdmin(idInvoice);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
