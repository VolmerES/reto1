package dev.bughunt.shop.payments;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * The bank's sandbox: it takes as long as the real one to answer, always declines the
 * test card 4000 0000 0000 0002 and remembers every charge.
 */
@Component
public class Bank {

    private final String alwaysDeclinedCard = "4000000000000002";
    private final Duration latency;
    private final List<Charge> charges = new CopyOnWriteArrayList<>();

    public Bank(@Value("${sandbox.bank.latency}") Duration latency) {
        this.latency = latency;
    }

    public void charge(String customerId, String card, BigDecimal amount) {
        simulateBankDelay();
        if (card.replace(" ", "").equals(alwaysDeclinedCard)) {
            throw new PaymentDeclinedException();
        }
        charges.add(new Charge(customerId, amount));
    }

    public List<Charge> chargesTo(String customerId) {
        return charges.stream()
                .filter(charge -> charge.customerId().equals(customerId))
                .toList();
    }

    private void simulateBankDelay() {
        try {
            Thread.sleep(latency.toMillis());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
