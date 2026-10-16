package dev.bughunt.shop.pricing;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
public class Coupon {

    @Id
    private String code;

    // What the coupon takes off, as a fraction: 0.15 is 15 %.
    @Column(precision = 3, scale = 2)
    private BigDecimal discountRate;

    protected Coupon() {
    }

    public Coupon(String code, int percentOff) {
        this.code = code;
        this.discountRate = BigDecimal.valueOf(percentOff, 2);
    }

    /** How much this coupon takes off the amount, rounded to the cent. */
    public BigDecimal discountFor(BigDecimal amount) {
        return amount.multiply(discountRate).setScale(2, RoundingMode.HALF_UP);
    }
}
