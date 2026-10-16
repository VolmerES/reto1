package dev.bughunt.shop.support;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import org.springframework.boot.test.context.TestComponent;
import org.springframework.core.env.Environment;
import org.springframework.web.client.RestClient;

/**
 * Calls the shop's API over HTTP, like a real client would.
 *
 * <p>Every product, customer and coupon gets a unique id, so tests never step on each other's data.
 */
@TestComponent
public class ShopClient {

    private final Environment environment;

    public ShopClient(Environment environment) {
        this.environment = environment;
    }

    public String addProduct(String name, String price, int stock) {
        String sku = uniqueId(name);
        post("/api/admin/products", Map.of("sku", sku, "name", name, "price", new BigDecimal(price), "stock", stock));
        return sku;
    }

    public void addPromotion(String sku, String price) {
        post("/api/admin/promotions", Map.of("sku", sku, "price", new BigDecimal(price), "membersOnly", false));
    }

    public void addMemberPromotion(String sku, String price) {
        post("/api/admin/promotions", Map.of("sku", sku, "price", new BigDecimal(price), "membersOnly", true));
    }

    public String addCoupon(String name, int percentOff) {
        String code = uniqueId(name);
        post("/api/admin/coupons", Map.of("code", code, "percentOff", percentOff));
        return code;
    }

    public String addCustomer(String name) {
        return addCustomer(name, false);
    }

    public String addMember(String name) {
        return addCustomer(name, true);
    }

    public OrderDraft order(String customerId) {
        return new OrderDraft(this, customerId);
    }

    public ApiResponse<OrderView> findOrder(Long orderId) {
        return send(http().get().uri("/api/orders/{id}", orderId), OrderView.class);
    }

    public ApiResponse<OrderView> cancel(Long orderId) {
        return send(http().post().uri("/api/orders/{id}/cancel", orderId), OrderView.class);
    }

    public ProductView productPage(String sku) {
        return send(http().get().uri("/api/products/{sku}", sku), ProductView.class).body();
    }

    public int stockOf(String sku) {
        return productPage(sku).stock();
    }

    public BigDecimal priceFor(String sku, String customerId) {
        return send(http().get().uri("/api/products/{sku}/price?customerId={id}", sku, customerId), PriceView.class)
                .body().price();
    }

    /** Places all the orders at the same moment, each from its own thread, and returns their HTTP statuses sorted. */
    public List<Integer> placeAtTheSameTime(OrderDraft... orders) throws InterruptedException {
        CountDownLatch go = new CountDownLatch(1);
        List<Integer> statuses = new ArrayList<>();
        List<Thread> buyers = new ArrayList<>();
        for (OrderDraft order : orders) {
            Thread buyer = new Thread(() -> {
                waitFor(go);
                int status = order.place().status();
                synchronized (statuses) {
                    statuses.add(status);
                }
            });
            buyer.start();
            buyers.add(buyer);
        }
        go.countDown();
        for (Thread buyer : buyers) {
            buyer.join(20_000);
        }
        synchronized (statuses) {
            return statuses.stream().sorted().toList();
        }
    }

    ApiResponse<OrderView> place(OrderDraft order) {
        return send(http().post().uri("/api/orders").body(order.asJson()), OrderView.class);
    }

    private String addCustomer(String name, boolean member) {
        String id = uniqueId(name);
        post("/api/admin/customers", Map.of("id", id, "name", name, "member", member));
        return id;
    }

    private void post(String path, Map<String, Object> json) {
        ApiResponse<Void> response = send(http().post().uri(path).body(json), Void.class);
        if (response.status() != 201) {
            throw new IllegalStateException("POST " + path + " answered " + response.status());
        }
    }

    private <T> ApiResponse<T> send(RestClient.RequestHeadersSpec<?> request, Class<T> bodyType) {
        return request.exchange((ignored, response) -> {
            int status = response.getStatusCode().value();
            if (response.getStatusCode().is2xxSuccessful()) {
                return new ApiResponse<>(status, response.bodyTo(bodyType), List.of());
            }
            ErrorView error = response.bodyTo(ErrorView.class);
            List<String> fields = error == null || error.fields() == null ? List.of() : error.fields();
            return new ApiResponse<>(status, null, fields);
        });
    }

    private RestClient http() {
        return RestClient.create("http://127.0.0.1:" + environment.getRequiredProperty("local.server.port"));
    }

    private String uniqueId(String name) {
        return name.toUpperCase().replace(' ', '-') + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private void waitFor(CountDownLatch go) {
        try {
            go.await();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
