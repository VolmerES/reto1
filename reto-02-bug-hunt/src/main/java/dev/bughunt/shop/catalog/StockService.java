package dev.bughunt.shop.catalog;

import dev.bughunt.shop.common.NotFoundException;
import dev.bughunt.shop.common.ShopService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.transaction.annotation.Transactional;

@ShopService
public class StockService {

    private final ProductRepository products;
    private final EntityManager entityManager;

    public StockService(ProductRepository products, EntityManager entityManager) {
        this.products = products;
        this.entityManager = entityManager;
    }

    /**
     * Takes the units out of stock. The row stays locked until the order is committed, so a second
     * order for the same product waits and then sees the real stock: the refresh reloads it from the
     * database instead of trusting the copy this transaction may already have in memory.
     */
    @Transactional
    public void removeUnits(String sku, int units) {
        Product product = findProduct(sku);
        entityManager.refresh(product, LockModeType.PESSIMISTIC_WRITE);
        product.removeFromStock(units);
    }

    @Transactional
    public void addUnits(String sku, int units) {
        findProduct(sku).addToStock(units);
    }

    private Product findProduct(String sku) {
        return products.findById(sku).orElseThrow(() -> new NotFoundException("Product", sku));
    }
}
