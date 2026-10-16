package dev.bughunt.shop.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.math.BigDecimal;

@Entity
public class Product {

    @Id
    private String sku;

    private String name;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    private int stock;

    private int unitsSold;

    protected Product() {
    }

    public Product(String sku, String name, BigDecimal price, int stock) {
        this.sku = sku;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    public boolean hasInStock(int units) {
        return stock >= units;
    }

    public void removeFromStock(int units) {
        if (!hasInStock(units)) {
            throw new OutOfStockException(sku);
        }
        stock -= units;
    }

    public void addToStock(int units) {
        stock += units;
    }

    public void recordSale(int units) {
        unitsSold += units;
    }

    public String sku() {
        return sku;
    }

    public String name() {
        return name;
    }

    public BigDecimal price() {
        return price;
    }

    public int stock() {
        return stock;
    }

    public int unitsSold() {
        return unitsSold;
    }
}
