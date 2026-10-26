package com.web.job;

import com.web.service.InvoiceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Mỗi phút hủy các đơn online quá hạn thanh toán và trả hàng về kho. */
@Component
@Lazy(false)
public class OrderExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(OrderExpiryJob.class);

    @Autowired
    private InvoiceService invoiceService;

    @Scheduled(fixedDelay = 60_000, initialDelay = 60_000)
    public void run() {
        try {
            int n = invoiceService.expireUnpaidOrders();
            if (n > 0) {
                log.info("Đã hủy {} đơn quá hạn thanh toán", n);
            }
        } catch (Exception e) {
            log.error("Lỗi khi hủy đơn quá hạn", e);
        }
    }
}
