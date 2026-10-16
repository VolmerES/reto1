package dev.bughunt.shop.catalog;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, String> {

    /** Locks the product's row until the transaction ends, so two orders can't take the same units. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.sku = :sku")
    Optional<Product> findForUpdate(String sku);
}
