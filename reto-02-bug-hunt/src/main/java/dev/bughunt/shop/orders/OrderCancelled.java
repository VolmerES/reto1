package dev.bughunt.shop.orders;

import java.util.List;

public record OrderCancelled(Long orderId, List<OrderLine> lines) {
}
