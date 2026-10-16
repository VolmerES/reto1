package dev.bughunt.shop.catalog;

import dev.bughunt.shop.common.NotFoundException;
import dev.bughunt.shop.common.ShopService;
import org.springframework.transaction.annotation.Transactional;

@ShopService
public class StockService {

    private final ProductRepository products;

    public StockService(ProductRepository products) {
        this.products = products;
    }

    /** Takes the units out of stock, waiting for any other order that is taking the same product. */
    @Transactional
    public void removeUnits(String sku, int units) {
        products.findForUpdate(sku)
                .orElseThrow(() -> new NotFoundException("Product", sku))
                .removeFromStock(units);
    }

    @Transactional
    public void addUnits(String sku, int units) {
        findProduct(sku).addToStock(units);
    }

    private Product findProduct(String sku) {
        return products.findById(sku).orElseThrow(() -> new NotFoundException("Product", sku));
    }
}
