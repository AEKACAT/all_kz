package com.darla.entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;
@Data
@Entity
@Table(name = "categories")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Category {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String nameKk;      // название на казахском

	@Column(nullable = false)
	private String nameRu;      // название на русском

	@Column(nullable = false, length = 1000)
	private String descriptionKk; // описание на казахском

	@Column(nullable = false, length = 1000)
	private String descriptionRu; // описание на русском

	@OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<Product> products;
}

