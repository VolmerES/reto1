package dev.bughunt.shop.pricing;

import dev.bughunt.shop.customers.Customer;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/** The promotions of one product. */
public class ProductPromotions {

    private final List<Promotion> promotions;

    public ProductPromotions(List<Promotion> promotions) {
        this.promotions = List.copyOf(promotions);
    }

    /** The promotions this customer can use. Returns a new object: these are cached and shared. */
    public ProductPromotions usableBy(Customer customer) {
        return new ProductPromotions(promotions.stream()
                .filter(promotion -> promotion.appliesTo(customer))
                .toList());
    }

    public Optional<BigDecimal> bestPrice() {
        return promotions.stream()
                .map(Promotion::price)
                .min(Comparator.naturalOrder());
    }
}
