// src/main/java/com/darla/repository/ProductRepository.java
package com.darla.repository;

import com.darla.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

	// Для fetchAllProducts
	@Override
	Page<Product> findAll(Pageable pageable);

	// Поиск по categoryId
	Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

	// Топ-10 последних продуктов
	@Query("SELECT p FROM Product p ORDER BY p.createdAt DESC")
	List<Product> findTopTenProducts();

	// Общее число продуктов
	@Query("SELECT COUNT(p) FROM Product p")
	int countProducts();

	// Поиск по подстроке в name или description
	@Query("""
        SELECT p FROM Product p
        WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%'))
    """)
	List<Product> findBySearchQuery(@Param("q") String query);
}
