package dev.bughunt.shop.pricing;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    List<Promotion> findBySku(String sku);

    List<Promotion> findBySkuAndMembersOnlyFalse(String sku);
}
