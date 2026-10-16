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
class Bug5MemberPriceTest {

    @Autowired
    private ShopClient shop;

    @Test
    void it_should_charge_a_member_the_member_price() {
        String tab = shop.addProduct("Galaxy Tab S11", "899.00", 10);
        shop.addMemberPromotion(tab, "799.00");
        String gema = shop.addMember("Gema");

        shop.productPage(tab);
        ApiResponse<OrderView> order = shop.order(gema).item(tab, 1).place();

        assertEquals(new BigDecimal("799.00"), order.body().total());
    }
}
