package dev.bughunt.shop.customers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CustomerController {

    private final CustomerService customers;

    public CustomerController(CustomerService customers) {
        this.customers = customers;
    }

    @PostMapping("/api/admin/customers")
    @ResponseStatus(HttpStatus.CREATED)
    public void addCustomer(@Valid @RequestBody NewCustomerRequest request) {
        customers.addCustomer(request);
    }
}
