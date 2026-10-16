package dev.bughunt.shop.storefront;

import dev.bughunt.shop.catalog.CatalogService;
import dev.bughunt.shop.catalog.Product;
import dev.bughunt.shop.common.ShopService;
import java.math.BigDecimal;

@ShopService
public class StorefrontService {

    private final CatalogService catalog;
    private final PublicPromotions publicPromotions;

    public StorefrontService(CatalogService catalog, PublicPromotions publicPromotions) {
        this.catalog = catalog;
        this.publicPromotions = publicPromotions;
    }

    /** The public page of a product, with the price that anyone would pay. */
    public ProductPage productPage(String sku) {
        Product product = catalog.getProduct(sku);
        BigDecimal price = publicPromotions.forProduct(sku)
                .bestPrice()
                .filter(promotionPrice -> promotionPrice.compareTo(product.price()) < 0)
                .orElse(product.price());
        return new ProductPage(product.sku(), product.name(), price, product.stock(), product.unitsSold());
    }
}
