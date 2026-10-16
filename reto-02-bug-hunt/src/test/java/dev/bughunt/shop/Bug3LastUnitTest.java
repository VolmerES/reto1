package dev.bughunt.shop;

import static org.junit.jupiter.api.Assertions.assertEquals;

import dev.bughunt.shop.support.ShopApiTest;
import dev.bughunt.shop.support.ShopClient;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@ShopApiTest
class Bug3LastUnitTest {

    @Autowired
    private ShopClient shop;

    @Test
    void it_should_sell_the_last_unit_only_once_when_two_orders_arrive_together() throws InterruptedException {
        String fold = shop.addProduct("Galaxy Z Fold7", "1999.00", 1);
        String carla = shop.addCustomer("Carla");
        String dani = shop.addCustomer("Dani");

        List<Integer> statuses = shop.placeAtTheSameTime(
                shop.order(carla).item(fold, 1),
                shop.order(dani).item(fold, 1));

        // One of them gets the Fold (201) and the other one is told there is none left (409).
        assertEquals(List.of(201, 409), statuses);
    }
}
