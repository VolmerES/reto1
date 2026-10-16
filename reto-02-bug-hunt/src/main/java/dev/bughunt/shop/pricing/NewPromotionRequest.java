package dev.bughunt.shop.pricing;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record NewPromotionRequest(@NotBlank String sku, @NotNull @Positive BigDecimal price, boolean membersOnly) {
}
