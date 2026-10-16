package dev.bughunt.shop.catalog;

import dev.bughunt.shop.common.NotFoundException;
import dev.bughunt.shop.common.ShopService;
import org.springframework.transaction.annotation.Transactional;

@ShopService
public class CatalogService {

    private final ProductRepository products;

    public CatalogService(ProductRepository products) {
        this.products = products;
    }

    @Transactional
    public void addProduct(NewProductRequest request) {
        products.save(new Product(request.sku(), request.name(), request.price(), request.stock()));
    }

    @Transactional
    public void recordSale(String sku, int units) {
        getProduct(sku).recordSale(units);
    }

    public Product getProduct(String sku) {
        return products.findById(sku).orElseThrow(() -> new NotFoundException("Product", sku));
    }
}
