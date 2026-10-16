package dev.bughunt.shop.customers;

import dev.bughunt.shop.common.NotFoundException;
import dev.bughunt.shop.common.ShopService;
import org.springframework.transaction.annotation.Transactional;

@ShopService
public class CustomerService {

    private final CustomerRepository customers;

    public CustomerService(CustomerRepository customers) {
        this.customers = customers;
    }

    @Transactional
    public void addCustomer(NewCustomerRequest request) {
        customers.save(new Customer(request.id(), request.name(), request.member()));
    }

    public Customer getCustomer(String id) {
        return customers.findById(id).orElseThrow(() -> new NotFoundException("Customer", id));
    }
}
