package dev.bughunt.shop.pricing;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PricingController {

    private final PricingService pricing;
    private final PromotionService promotions;
    private final CouponService coupons;

    public PricingController(PricingService pricing, PromotionService promotions, CouponService coupons) {
        this.pricing = pricing;
        this.promotions = promotions;
        this.coupons = coupons;
    }

    @GetMapping("/api/products/{sku}/price")
    public PriceResponse price(@PathVariable String sku, @RequestParam String customerId) {
        return pricing.priceFor(sku, customerId);
    }

    @PostMapping("/api/admin/promotions")
    @ResponseStatus(HttpStatus.CREATED)
    public void addPromotion(@Valid @RequestBody NewPromotionRequest request) {
        promotions.addPromotion(request);
    }

    @PostMapping("/api/admin/coupons")
    @ResponseStatus(HttpStatus.CREATED)
    public void addCoupon(@Valid @RequestBody NewCouponRequest request) {
        coupons.addCoupon(request);
    }
}
