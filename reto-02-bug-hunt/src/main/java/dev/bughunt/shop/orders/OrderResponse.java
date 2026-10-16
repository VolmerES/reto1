package dev.bughunt.shop.orders;

import java.math.BigDecimal;

public record OrderResponse(Long id, String customerId, OrderStatus status, BigDecimal total) {

    public OrderResponse(Order order) {
        this(order.id(), order.customerId(), order.status(), order.total());
    }
}
