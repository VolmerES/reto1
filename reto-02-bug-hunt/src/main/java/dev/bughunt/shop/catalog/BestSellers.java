package dev.bughunt.shop.catalog;

import dev.bughunt.shop.orders.OrderLine;
import dev.bughunt.shop.orders.OrderPlaced;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Counts how many units of each product we sell, for the best-sellers list. */
@Component
public class BestSellers {

    private final CatalogService catalog;

    public BestSellers(CatalogService catalog) {
        this.catalog = catalog;
    }

    // Counted in the same transaction as the order, so a sale that fails is never counted.
    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void countSale(OrderPlaced placedOrder) {
        for (OrderLine line : placedOrder.lines()) {
            catalog.recordSale(line.sku(), line.quantity());
        }
    }
}
