package dev.bughunt.shop.orders;

import java.util.List;

public record OrderPlaced(Long orderId, List<OrderLine> lines) {
}
