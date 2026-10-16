package dev.bughunt.shop.pricing;

import dev.bughunt.shop.common.NotFoundException;
import dev.bughunt.shop.common.ShopService;
import org.springframework.transaction.annotation.Transactional;

@ShopService
public class CouponService {

    private final CouponRepository coupons;

    public CouponService(CouponRepository coupons) {
        this.coupons = coupons;
    }

    @Transactional
    public void addCoupon(NewCouponRequest request) {
        coupons.save(new Coupon(request.code(), request.percentOff()));
    }

    public Coupon getCoupon(String code) {
        return coupons.findById(code).orElseThrow(() -> new NotFoundException("Coupon", code));
    }
}
