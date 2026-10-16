package dev.bughunt.shop.pricing;

import dev.bughunt.shop.customers.Customer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.math.BigDecimal;

/** A special price for a product, for everyone or only for members. */
@Entity
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sku;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    private boolean membersOnly;

    protected Promotion() {
    }

    public Promotion(String sku, BigDecimal price, boolean membersOnly) {
        this.sku = sku;
        this.price = price;
        this.membersOnly = membersOnly;
    }

    public boolean appliesTo(Customer customer) {
        return !membersOnly || customer.isMember();
    }

    public BigDecimal price() {
        return price;
    }
}
