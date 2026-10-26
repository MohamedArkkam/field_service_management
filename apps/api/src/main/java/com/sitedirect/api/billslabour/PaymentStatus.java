package com.sitedirect.api.billslabour;

import java.math.BigDecimal;

public enum PaymentStatus {
    UNPAID,
    PARTIAL,
    PAID;

    public static PaymentStatus fromAmounts(BigDecimal amount, BigDecimal amountPaid) {
        if (amountPaid.compareTo(BigDecimal.ZERO) == 0) {
            return UNPAID;
        }
        if (amountPaid.compareTo(amount) == 0) {
            return PAID;
        }
        if (amountPaid.compareTo(BigDecimal.ZERO) > 0 && amountPaid.compareTo(amount) < 0) {
            return PARTIAL;
        }
        throw new IllegalArgumentException("amountPaid must be between 0 and amount");
    }
}
