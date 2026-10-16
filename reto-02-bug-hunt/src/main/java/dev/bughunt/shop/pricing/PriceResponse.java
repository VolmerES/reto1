package dev.bughunt.shop.pricing;

import java.math.BigDecimal;

public record PriceResponse(String sku, String customerId, BigDecimal listPrice, BigDecimal price) {
}
