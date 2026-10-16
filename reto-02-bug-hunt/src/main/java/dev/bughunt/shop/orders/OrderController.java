package dev.bughunt.shop.orders;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {

    private final OrderService orders;
    private final CardNumberValidator cardNumbers;

    public OrderController(OrderService orders, CardNumberValidator cardNumbers) {
        this.orders = orders;
        this.cardNumbers = cardNumbers;
    }

    @InitBinder("placeOrderRequest")
    void checkCardNumbers(WebDataBinder binder) {
        binder.addValidators(cardNumbers);
    }

    @PostMapping("/api/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        return orders.placeOrder(request);
    }

    @GetMapping("/api/orders/{orderId}")
    public OrderResponse getOrder(@PathVariable long orderId) {
        return orders.getOrder(orderId);
    }

    @PostMapping("/api/orders/{orderId}/cancel")
    public OrderResponse cancelOrder(@PathVariable long orderId) {
        return orders.cancelOrder(orderId);
    }
}
