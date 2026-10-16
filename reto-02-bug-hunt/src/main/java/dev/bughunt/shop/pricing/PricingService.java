package dev.bughunt.shop.pricing;

import dev.bughunt.shop.catalog.CatalogService;
import dev.bughunt.shop.catalog.Product;
import dev.bughunt.shop.common.ShopService;
import dev.bughunt.shop.customers.Customer;
import dev.bughunt.shop.customers.CustomerService;
import java.math.BigDecimal;

@ShopService
public class PricingService {

    private final PromotionService promotions;
    private final CouponService coupons;
    private final CatalogService catalog;
    private final CustomerService customers;

    public PricingService(PromotionService promotions, CouponService coupons, CatalogService catalog,
                          CustomerService customers) {
        this.promotions = promotions;
        this.coupons = coupons;
        this.catalog = catalog;
        this.customers = customers;
    }

    public PriceResponse priceFor(String sku, String customerId) {
        Product product = catalog.getProduct(sku);
        Customer customer = customers.getCustomer(customerId);
        return new PriceResponse(sku, customerId, product.price(), unitPriceFor(product, customer));
    }

    /** What one unit costs this customer: the lowest promotion they can use, or the list price. */
    public BigDecimal unitPriceFor(Product product, Customer customer) {
        return promotions.promotionsOf(product.sku())
                .usableBy(customer)
                .bestPrice()
                .filter(price -> price.compareTo(product.price()) < 0)
                .orElse(product.price());
    }

    public BigDecimal applyCoupon(BigDecimal amount, String couponCode) {
        if (couponCode == null || couponCode.isBlank()) {
            return amount;
        }
        return amount.subtract(coupons.getCoupon(couponCode).discountFor(amount));
    }
}
