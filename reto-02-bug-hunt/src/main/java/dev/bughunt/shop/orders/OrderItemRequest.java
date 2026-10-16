package dev.bughunt.shop.orders;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record OrderItemRequest(@NotBlank String sku, @Positive int quantity) {
}
