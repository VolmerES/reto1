package dev.bughunt.shop.shipping;

import dev.bughunt.shop.orders.OrderPlaced;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** The warehouse's sandbox: booking a delivery only takes its time. */
@Component
public class Warehouse {

    private final Duration latency;

    public Warehouse(@Value("${sandbox.warehouse.latency}") Duration latency) {
        this.latency = latency;
    }

    // We book the delivery right before the order is committed: if the warehouse
    // can't take it, the order is not saved either.
    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void bookDelivery(OrderPlaced placedOrder) {
        try {
            Thread.sleep(latency.toMillis());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
