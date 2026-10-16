package dev.bughunt.shop.storefront;

import java.math.BigDecimal;

public record ProductPage(String sku, String name, BigDecimal price, int stock, int unitsSold) {
}
