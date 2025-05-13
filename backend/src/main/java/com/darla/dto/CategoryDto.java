package com.darla.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;

import lombok.Builder;
import lombok.*;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDto {
	private Long id;

	@NotBlank(message = "nameKk не может быть пустым")
	private String nameKk;
	private String name;

	@NotBlank(message = "nameRu не может быть пустым")
	private String nameRu;

	@NotBlank(message = "descriptionKk не может быть пустым")
	private String descriptionKk;
	private String description;

	@NotBlank(message = "descriptionRu не может быть пустым")
	private String descriptionRu;
}

