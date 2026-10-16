package dev.bughunt.shop.support;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** An order that is being written: {@code shop.order(ana).item(fold, 1).coupon(code).place()}. */
public class OrderDraft {

    private final ShopClient shop;
    private final String customerId;
    private final List<Map<String, Object>> items = new ArrayList<>();
    private String card = "4242 4242 4242 4242";
    private String couponCode;

    OrderDraft(ShopClient shop, String customerId) {
        this.shop = shop;
        this.customerId = customerId;
    }

    public OrderDraft item(String sku, int quantity) {
        items.add(Map.of("sku", sku, "quantity", quantity));
        return this;
    }

    public OrderDraft coupon(String couponCode) {
        this.couponCode = couponCode;
        return this;
    }

    public OrderDraft card(String card) {
        this.card = card;
        return this;
    }

    public ApiResponse<OrderView> place() {
        return shop.place(this);
    }

    Map<String, Object> asJson() {
        Map<String, Object> json = new HashMap<>();
        json.put("customerId", customerId);
        json.put("card", card);
        json.put("couponCode", couponCode);
        json.put("items", items);
        return json;
    }
}
