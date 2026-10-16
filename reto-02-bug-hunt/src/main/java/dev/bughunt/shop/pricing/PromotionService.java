package dev.bughunt.shop.pricing;

import dev.bughunt.shop.catalog.CatalogService;
import dev.bughunt.shop.common.ShopService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

@ShopService
public class PromotionService {

    private final PromotionRepository promotions;
    private final CatalogService catalog;

    public PromotionService(PromotionRepository promotions, CatalogService catalog) {
        this.promotions = promotions;
        this.catalog = catalog;
    }

    // Every price we show needs the promotions, and they hardly ever change,
    // so we keep them in memory until someone adds a new one.
    @Cacheable("promotions")
    public ProductPromotions promotionsOf(String sku) {
        return new ProductPromotions(promotions.findBySku(sku));
    }

    @Transactional
    @CacheEvict(cacheNames = {"promotions", "publicPromotions"}, key = "#request.sku()")
    public void addPromotion(NewPromotionRequest request) {
        catalog.getProduct(request.sku());
        promotions.save(new Promotion(request.sku(), request.price(), request.membersOnly()));
    }
}
