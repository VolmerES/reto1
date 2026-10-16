package dev.bughunt.shop;

import static org.junit.jupiter.api.Assertions.assertEquals;

import dev.bughunt.shop.support.ApiResponse;
import dev.bughunt.shop.support.ShopApiTest;
import dev.bughunt.shop.support.OrderView;
import dev.bughunt.shop.support.ShopClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@ShopApiTest
class Bug1NegativeQuantityTest {

    @Autowired
    private ShopClient shop;

    @Test
    void it_should_reject_an_order_with_a_negative_quantity() {
        String fold = shop.addProduct("Galaxy Z Fold7", "1999.00", 3);
        String ana = shop.addCustomer("Ana");

        ApiResponse<OrderView> order = shop.order(ana).item(fold, -1).place();

        assertEquals(400, order.status());
    }
}
