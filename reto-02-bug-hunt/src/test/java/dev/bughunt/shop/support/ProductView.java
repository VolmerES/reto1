package dev.bughunt.shop.support;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ProductView(String sku, String name, BigDecimal price, int stock, int unitsSold) {
}
