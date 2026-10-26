package com.web.utils;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Trạng thái đơn hàng và các bước chuyển hợp lệ.
 *
 * CHO_THANH_TOAN (7) ─► DANG_CHO_XAC_NHAN (1) ─► DA_XAC_NHAN (2) ─► DA_GUI (3) ─► DA_NHAN (4)
 *        │                     │                      │                  └──────► KHONG_NHAN_HANG (6)
 *        └──────────┬──────────┴──────────────────────┘
 *                   ▼
 *                DA_HUY (5)
 */
public class StatusUtils {

    public static final Long DANG_CHO_XAC_NHAN = 1L;
    public static final Long DA_XAC_NHAN = 2L;
    public static final Long DA_GUI = 3L;
    public static final Long DA_NHAN = 4L;
    public static final Long DA_HUY = 5L;
    public static final Long KHONG_NHAN_HANG = 6L;
    public static final Long CHO_THANH_TOAN = 7L;

    /** Tên mặc định, dùng khi khởi tạo database mới. */
    public static final Map<Long, String> NAMES = Map.of(
            DANG_CHO_XAC_NHAN, "Đang chờ xác nhận",
            DA_XAC_NHAN, "Đã xác nhận",
            DA_GUI, "Đã gửi",
            DA_NHAN, "Đã nhận",
            DA_HUY, "Đã hủy",
            KHONG_NHAN_HANG, "Không nhận hàng",
            CHO_THANH_TOAN, "Chờ thanh toán"
    );

    /** Các bước admin được phép chuyển (CHO_THANH_TOAN -> DANG_CHO_XAC_NHAN do hệ thống làm khi thanh toán xong). */
    private static final Map<Long, List<Long>> ADMIN_TRANSITIONS = Map.of(
            CHO_THANH_TOAN, List.of(DA_HUY),
            DANG_CHO_XAC_NHAN, List.of(DA_XAC_NHAN, DA_HUY),
            DA_XAC_NHAN, List.of(DA_GUI, DA_HUY),
            DA_GUI, List.of(DA_NHAN, KHONG_NHAN_HANG)
    );

    private StatusUtils() {
    }

    public static List<Long> nextStatuses(Long current) {
        return ADMIN_TRANSITIONS.getOrDefault(current, Collections.emptyList());
    }

    public static boolean canTransition(Long from, Long to) {
        return nextStatuses(from).contains(to);
    }

    /** Khách được tự hủy khi đơn chưa được shop xác nhận. */
    public static boolean userCanCancel(Long current) {
        return Objects.equals(current, CHO_THANH_TOAN) || Objects.equals(current, DANG_CHO_XAC_NHAN);
    }

    /** Trạng thái kết thúc mà hàng quay về kho. */
    public static boolean returnsStock(Long status) {
        return Objects.equals(status, DA_HUY) || Objects.equals(status, KHONG_NHAN_HANG);
    }
}
