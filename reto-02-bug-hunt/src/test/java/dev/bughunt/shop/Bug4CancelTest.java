package dev.bughunt.shop;

import static org.junit.jupiter.api.Assertions.assertEquals;

import dev.bughunt.shop.support.ShopApiTest;
import dev.bughunt.shop.support.OrderView;
import dev.bughunt.shop.support.ShopClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@ShopApiTest
class Bug4CancelTest {

    @Autowired
    private ShopClient shop;

    @Test
    void it_should_put_the_units_back_in_stock_when_an_order_is_cancelled() {
        String watch = shop.addProduct("Galaxy Watch8", "299.00", 3);
        String elena = shop.addCustomer("Elena");
        OrderView order = shop.order(elena).item(watch, 1).place().body();

        shop.cancel(order.id());

        assertEquals(3, shop.stockOf(watch));
    }
}
