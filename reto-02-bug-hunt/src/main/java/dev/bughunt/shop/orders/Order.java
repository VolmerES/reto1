package dev.bughunt.shop.orders;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_lines")
    private List<OrderLine> lines = new ArrayList<>();

    protected Order() {
    }

    public Order(String customerId, List<OrderLine> lines, BigDecimal total) {
        this.customerId = customerId;
        this.lines = new ArrayList<>(lines);
        this.total = total;
        this.status = OrderStatus.PLACED;
    }

    public void cancel() {
        if (status == OrderStatus.CANCELLED) {
            throw new OrderAlreadyCancelledException(id);
        }
        status = OrderStatus.CANCELLED;
    }

    public Long id() {
        return id;
    }

    public String customerId() {
        return customerId;
    }

    public OrderStatus status() {
        return status;
    }

    public BigDecimal total() {
        return total;
    }

    public List<OrderLine> lines() {
        return List.copyOf(lines);
    }
}
