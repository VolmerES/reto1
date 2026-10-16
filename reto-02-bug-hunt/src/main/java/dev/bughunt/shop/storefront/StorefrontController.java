package dev.bughunt.shop.storefront;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StorefrontController {

    private final StorefrontService storefront;

    public StorefrontController(StorefrontService storefront) {
        this.storefront = storefront;
    }

    @GetMapping("/api/products/{sku}")
    public ProductPage productPage(@PathVariable String sku) {
        return storefront.productPage(sku);
    }
}
