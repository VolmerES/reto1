package dev.bughunt.shop;

import static org.junit.jupiter.api.Assertions.assertEquals;

import dev.bughunt.shop.support.ApiResponse;
import dev.bughunt.shop.support.ShopApiTest;
import dev.bughunt.shop.support.OrderView;
import dev.bughunt.shop.support.ShopClient;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@ShopApiTest
class Bug2CouponTest {

    @Autowired
    private ShopClient shop;

    @Test
    void it_should_take_fifteen_percent_off_with_a_fifteen_percent_coupon() {
        String buds = shop.addProduct("Galaxy Buds3 Pro", "200.00", 10);
        String welcome = shop.addCoupon("WELCOME15", 15);
        String bruno = shop.addCustomer("Bruno");

        ApiResponse<OrderView> order = shop.order(bruno).item(buds, 1).coupon(welcome).place();

        assertEquals(new BigDecimal("170.00"), order.body().total());
    }
}
