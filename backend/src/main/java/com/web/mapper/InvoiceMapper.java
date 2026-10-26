package com.web.mapper;

import com.web.dto.response.InvoiceResponse;
import com.web.entity.Invoice;
import com.web.enums.PayType;
import com.web.utils.StatusUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class InvoiceMapper {

    @Autowired
    private ModelMapper mapper;

    @Autowired
    private UserAddressMapper userAddressMapper;

    public InvoiceResponse invoiceToInvoiceResponse(Invoice invoice){
        InvoiceResponse response = mapper.map(invoice, InvoiceResponse.class);
        if (invoice.getUserAddress() != null) {
            response.setUserAddress(userAddressMapper.userAdressToUserAddResponse(invoice.getUserAddress()));
        }
        response.setPayableAmount(invoice.getPayableAmount());
        response.setPaymentUrl(null);
        if (invoice.getStatus() != null) {
            Long st = invoice.getStatus().getId();
            response.setNextStatuses(new ArrayList<>(StatusUtils.nextStatuses(st)));
            response.setCancelable(StatusUtils.userCanCancel(st) && !Boolean.TRUE.equals(invoice.getPaid()));
        }
        if (response.getPaid() == null) {
            // dữ liệu cũ chưa có cột paid
            response.setPaid(PayType.PAYMENT_DELIVERY.equals(invoice.getPayType())
                    ? invoice.getStatus() != null && StatusUtils.DA_NHAN.equals(invoice.getStatus().getId())
                    : invoice.getPayType() != null);
        }
        return response;
    }

    public List<InvoiceResponse> invoiceListToInvoiceResponseList(List<Invoice> list){
        List<InvoiceResponse> result = new ArrayList<>();
        for(Invoice i : list){
            result.add(invoiceToInvoiceResponse(i));
        }
        return result;
    }
}
