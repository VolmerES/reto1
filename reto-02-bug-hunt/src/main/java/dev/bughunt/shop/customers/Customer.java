package dev.bughunt.shop.customers;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Customer {

    @Id
    private String id;

    private String name;

    private boolean member;

    protected Customer() {
    }

    public Customer(String id, String name, boolean member) {
        this.id = id;
        this.name = name;
        this.member = member;
    }

    public String id() {
        return id;
    }

    public String name() {
        return name;
    }

    public boolean isMember() {
        return member;
    }
}
