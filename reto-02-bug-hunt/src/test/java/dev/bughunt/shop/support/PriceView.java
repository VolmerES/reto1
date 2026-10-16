package dev.bughunt.shop.support;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
record PriceView(BigDecimal price) {
}
