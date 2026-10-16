package dev.bughunt.shop.customers;

import jakarta.validation.constraints.NotBlank;

public record NewCustomerRequest(@NotBlank String id, @NotBlank String name, boolean member) {
}
