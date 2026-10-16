package dev.bughunt.shop.support;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OrderView(Long id, String customerId, String status, BigDecimal total) {
}
