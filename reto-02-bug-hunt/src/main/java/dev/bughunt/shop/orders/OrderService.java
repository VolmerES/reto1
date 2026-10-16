package dev.bughunt.shop.orders;

import dev.bughunt.shop.catalog.CatalogService;
import dev.bughunt.shop.catalog.StockService;
import dev.bughunt.shop.catalog.Product;
import dev.bughunt.shop.common.NotFoundException;
import dev.bughunt.shop.common.ShopService;
import dev.bughunt.shop.customers.Customer;
import dev.bughunt.shop.customers.CustomerService;
import dev.bughunt.shop.payments.Bank;
import dev.bughunt.shop.pricing.PricingService;
import java.math.BigDecimal;
import java.util.List;
import java.util.TreeMap;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

@ShopService
public class OrderService {

    private final OrderRepository orders;
    private final CustomerService customers;
    private final CatalogService catalog;
    private final StockService stock;
    private final PricingService pricing;
    private final Bank bank;
    private final ApplicationEventPublisher events;

    public OrderService(OrderRepository orders, CustomerService customers, CatalogService catalog,
                        StockService stock, PricingService pricing, Bank bank,
                        ApplicationEventPublisher events) {
        this.orders = orders;
        this.customers = customers;
        this.catalog = catalog;
        this.stock = stock;
        this.pricing = pricing;
        this.bank = bank;
        this.events = events;
    }

    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request) {
        Customer customer = customers.getCustomer(request.customerId());

        // Las unidades se reservan antes de nada y antes de cobrar: si el pago falla, la transacción
        // las devuelve al estante. Por SKU y en orden, para que dos pedidos no se interbloqueen, y
        // sumando las líneas repetidas de un mismo producto, porque la reserva relee la fila de la base
        // bajo bloqueo y un segundo descuento del mismo SKU perdería el anterior, aún sin guardar.
        request.items().stream()
                .collect(Collectors.groupingBy(OrderItemRequest::sku, TreeMap::new,
                        Collectors.summingInt(OrderItemRequest::quantity)))
                .forEach(stock::removeUnits);

        List<OrderLine> lines = request.items().stream()
                .map(item -> toOrderLine(item, customer))
                .toList();

        BigDecimal total = pricing.applyCoupon(subtotalOf(lines), request.couponCode());
        bank.charge(customer.id(), request.card(), total);

        Order order = orders.save(new Order(customer.id(), lines, total));
        events.publishEvent(new OrderPlaced(order.id(), order.lines()));
        return new OrderResponse(order);
    }

    public OrderResponse getOrder(long orderId) {
        return new OrderResponse(findOrder(orderId));
    }

    @Transactional
    public OrderResponse cancelOrder(long orderId) {
        Order order = findOrder(orderId);
        order.cancel();
        orders.save(order);
        events.publishEvent(new OrderCancelled(order.id(), order.lines()));
        return new OrderResponse(order);
    }

    private OrderLine toOrderLine(OrderItemRequest item, Customer customer) {
        Product product = catalog.getProduct(item.sku());
        return new OrderLine(product.sku(), item.quantity(), pricing.unitPriceFor(product, customer));
    }

    private BigDecimal subtotalOf(List<OrderLine> lines) {
        return lines.stream()
                .map(OrderLine::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Order findOrder(long orderId) {
        return orders.findById(orderId).orElseThrow(() -> new NotFoundException("Order", orderId));
    }
}
