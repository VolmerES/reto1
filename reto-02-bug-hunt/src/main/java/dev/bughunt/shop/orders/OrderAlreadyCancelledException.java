package dev.bughunt.shop.orders;

public class OrderAlreadyCancelledException extends RuntimeException {

    public OrderAlreadyCancelledException(Long orderId) {
        super("Order " + orderId + " is already cancelled");
    }
}
