package dev.bughunt.shop.catalog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record NewProductRequest(
        @NotBlank String sku,
        @NotBlank String name,
        @NotNull @Positive BigDecimal price,
        @PositiveOrZero int stock) {
}
