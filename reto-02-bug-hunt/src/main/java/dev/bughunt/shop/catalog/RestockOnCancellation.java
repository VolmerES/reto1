package dev.bughunt.shop.catalog;

import dev.bughunt.shop.orders.OrderCancelled;
import dev.bughunt.shop.orders.OrderLine;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

/** Puts the units of a cancelled order back on the shelf. */
@Component
public class RestockOnCancellation {

    private final StockService stock;

    public RestockOnCancellation(StockService stock) {
        this.stock = stock;
    }

    // Only once the cancellation is saved: if it fails, the units must stay where they are.
    // After the commit the original transaction can't save anything else: the restock needs its own.
    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void restock(OrderCancelled cancellation) {
        for (OrderLine line : cancellation.lines()) {
            stock.addUnits(line.sku(), line.quantity());
        }
    }
}
