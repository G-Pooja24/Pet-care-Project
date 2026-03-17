package com.petproject.petproject.dto;

import com.petproject.petproject.entity.Address;
import lombok.Data;

@Data
public class OrderRequest {
    private Address shippingAddress;
    private String paymentMethod; // "COD" or "ONLINE"
}
