package dev.bughunt.shop.payments;

import java.math.BigDecimal;

public record Charge(String customerId, BigDecimal amount) {
}
