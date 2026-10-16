package dev.bughunt.shop.orders;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;

@Embeddable
public class OrderLine {

    private String sku;

    private int quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitPrice;

    protected OrderLine() {
    }

    public OrderLine(String sku, int quantity, BigDecimal unitPrice) {
        this.sku = sku;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public BigDecimal lineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public String sku() {
        return sku;
    }

    public int quantity() {
        return quantity;
    }
}
