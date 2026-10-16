package dev.bughunt.shop.pricing;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<Coupon, String> {
}
