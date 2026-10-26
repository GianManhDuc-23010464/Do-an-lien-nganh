package com.web.utils;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class StatusUtilsTest {

    @Test
    void followsOrderFlow() {
        assertTrue(StatusUtils.canTransition(StatusUtils.DANG_CHO_XAC_NHAN, StatusUtils.DA_XAC_NHAN));
        assertTrue(StatusUtils.canTransition(StatusUtils.DA_XAC_NHAN, StatusUtils.DA_GUI));
        assertTrue(StatusUtils.canTransition(StatusUtils.DA_GUI, StatusUtils.DA_NHAN));
        assertTrue(StatusUtils.canTransition(StatusUtils.DA_GUI, StatusUtils.KHONG_NHAN_HANG));
    }

    @Test
    void cannotSkipSteps() {
        assertFalse(StatusUtils.canTransition(StatusUtils.DANG_CHO_XAC_NHAN, StatusUtils.DA_NHAN));
        assertFalse(StatusUtils.canTransition(StatusUtils.DA_GUI, StatusUtils.DA_HUY));
        assertFalse(StatusUtils.canTransition(StatusUtils.DA_NHAN, StatusUtils.DA_HUY));
        assertFalse(StatusUtils.canTransition(StatusUtils.CHO_THANH_TOAN, StatusUtils.DANG_CHO_XAC_NHAN));
    }

    @Test
    void userCancelOnlyBeforeConfirmation() {
        assertTrue(StatusUtils.userCanCancel(StatusUtils.CHO_THANH_TOAN));
        assertTrue(StatusUtils.userCanCancel(StatusUtils.DANG_CHO_XAC_NHAN));
        assertFalse(StatusUtils.userCanCancel(StatusUtils.DA_XAC_NHAN));
        assertFalse(StatusUtils.userCanCancel(StatusUtils.DA_GUI));
    }

    @Test
    void cancelAndRefusedReturnStock() {
        assertTrue(StatusUtils.returnsStock(StatusUtils.DA_HUY));
        assertTrue(StatusUtils.returnsStock(StatusUtils.KHONG_NHAN_HANG));
        assertFalse(StatusUtils.returnsStock(StatusUtils.DA_NHAN));
    }
}
