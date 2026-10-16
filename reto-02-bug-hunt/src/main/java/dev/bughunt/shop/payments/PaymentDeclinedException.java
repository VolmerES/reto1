package dev.bughunt.shop.payments;

public class PaymentDeclinedException extends RuntimeException {

    public PaymentDeclinedException() {
        super("The bank declined the card");
    }
}
