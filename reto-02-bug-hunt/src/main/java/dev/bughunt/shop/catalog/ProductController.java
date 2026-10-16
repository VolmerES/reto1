package dev.bughunt.shop.catalog;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {

    private final CatalogService catalog;

    public ProductController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @PostMapping("/api/admin/products")
    @ResponseStatus(HttpStatus.CREATED)
    public void addProduct(@Valid @RequestBody NewProductRequest request) {
        catalog.addProduct(request);
    }
}
