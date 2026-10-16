package dev.bughunt.shop.storefront;

import dev.bughunt.shop.pricing.ProductPromotions;
import dev.bughunt.shop.pricing.PromotionRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

/** The promotions anyone can use, for the public product page. */
@Component
public class PublicPromotions {

    private final PromotionRepository promotions;

    public PublicPromotions(PromotionRepository promotions) {
        this.promotions = promotions;
    }

    // The product page is the most visited page of the shop, so this is cached as well.
    @Cacheable("publicPromotions")
    public ProductPromotions forProduct(String sku) {
        return new ProductPromotions(promotions.findBySkuAndMembersOnlyFalse(sku));
    }
}
