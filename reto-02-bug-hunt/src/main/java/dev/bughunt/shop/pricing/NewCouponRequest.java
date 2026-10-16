package dev.bughunt.shop.pricing;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record NewCouponRequest(@NotBlank String code, @Min(1) @Max(100) int percentOff) {
}
