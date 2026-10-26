package com.web.config;

import com.web.utils.StatusUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Chạy mỗi lần khởi động:
 *  - đảm bảo bảng statuses có đủ 7 trạng thái (thêm "Chờ thanh toán" cho DB cũ);
 *  - điền giá trị cho các cột mới (paid, user_id, shipping_fee…) của đơn hàng cũ.
 */
@Component
@Lazy(false)
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final JdbcTemplate jdbc;

    public DataInitializer(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            for (Map.Entry<Long, String> e : StatusUtils.NAMES.entrySet()) {
                Integer count = jdbc.queryForObject("select count(*) from statuses where id = ?", Integer.class, e.getKey());
                if (count == null || count == 0) {
                    jdbc.update("insert into statuses(id, name) values (?, ?)", e.getKey(), e.getValue());
                }
            }
            // pay_type: 0 = MoMo, 1 = COD, 2 = VNPay (thứ tự enum PayType)
            jdbc.update("update invoice set paid = case when pay_type in (0, 2) or status_current = 4 then true else false end where paid is null");
            jdbc.update("update invoice set user_id = (select ua.user_id from user_address ua where ua.id = invoice.user_address_id) "
                    + "where user_id is null and user_address_id is not null");
            jdbc.update("update invoice set shipping_fee = 0 where shipping_fee is null");
            jdbc.update("update invoice set discount = 0 where discount is null");
        } catch (Exception e) {
            log.warn("DataInitializer: {}", e.getMessage());
        }
    }
}
