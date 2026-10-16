package dev.bughunt.shop.catalog;

public class OutOfStockException extends RuntimeException {

    public OutOfStockException(String sku) {
        super("Not enough stock of " + sku);
    }
}
