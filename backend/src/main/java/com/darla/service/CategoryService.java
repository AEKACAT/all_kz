package com.darla.service;

import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.*;

import com.darla.dto.Response;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.darla.dto.CategoryDto;
import com.darla.entity.Category;
import com.darla.repository.CategoryRepository;
import com.darla.repository.ProductRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Validator;

@Service
public class CategoryService {

	private final CategoryRepository categoryRepo;
	private final ProductRepository productRepository;
	private final Validator validator;

	public CategoryService(CategoryRepository categoryRepo, ProductRepository productRepository, Validator validator) {
		this.categoryRepo = categoryRepo;
		this.productRepository = productRepository;
		this.validator = validator;
	}

	// Add a new category
//	 returns a string and accepts category dto
	public String addCategory(CategoryDto dto) {
		// Маппим DTO на сущность
		Category entity = Category.builder()
				.nameKk(dto.getNameKk())
				.nameRu(dto.getNameRu())
				.descriptionKk(dto.getDescriptionKk())
				.descriptionRu(dto.getDescriptionRu())
				.build();

		// Сохраняем в БД
		categoryRepo.save(entity);

		// Логируем
		ActivityLogs.addEntry("new category added: " + dto.getNameRu());
		return "Category added successfully";
	}

	// add several categories [for testing purpose only]
	// returns a string and accepts a list of category dto
	public String addCategories(List<CategoryDto> categoryDtos) {
		List<Category> categories = categoryDtos.stream()
				.map(dto -> Category.builder()
						.nameKk(dto.getNameKk())
						.nameRu(dto.getNameRu())
						.descriptionKk(dto.getDescriptionKk())
						.descriptionRu(dto.getDescriptionRu())
						.build())
				.toList();

		categoryRepo.saveAll(categories);
		ActivityLogs.addEntry("Multiple categories added");
		return "Categories added successfully";
	}

	// Get all categories
	// returns a list of category dto
	public List<CategoryDto> fetchCategories(Locale locale) {
		boolean isKk = "kk".equals(locale.getLanguage());
		return categoryRepo.findAll().stream()
				.map(cat -> CategoryDto.builder()
						.id(cat.getId())
						// выбираем имя в зависимости от locale
						.name(isKk ? cat.getNameKk() : cat.getNameRu())
						// если у DTO есть общий description, то тоже так:
						.description(isKk
								? cat.getDescriptionKk()
								: cat.getDescriptionRu())
						// если нужны оба поля – оставьте descriptionKk/descriptionRu
						//.descriptionKk(cat.getDescriptionKk())
						//.descriptionRu(cat.getDescriptionRu())
						.build())
				.toList();
	}


	// fetch a category by id
	// returns a category dto and accepts an id
	public CategoryDto fetchCategoryById(Long id,Locale locale) {
		// Получаем сущность из БД
		Category cat = categoryRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("Category not found"));
		boolean isKk = "kk".equals(locale.getLanguage());

		// Маппим на DTO с мультиязычными полями
		return CategoryDto.builder()
				.id(cat.getId())
				.name(isKk ? cat.getNameKk() : cat.getNameRu())
				.description(isKk
						? cat.getDescriptionKk()
						: cat.getDescriptionRu())
				.build();
	}


	// update a category by id
	// returns a string and accepts an id and category dto
	public String updateCategory(Long id, CategoryDto dto) {
		Category cat = categoryRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("Category not found"));
		cat.setNameKk(dto.getNameKk());
		cat.setNameRu(dto.getNameRu());
		cat.setDescriptionKk(dto.getDescriptionKk());
		cat.setDescriptionRu(dto.getDescriptionRu());
		categoryRepo.save(cat);
		ActivityLogs.addEntry("category updated: " + dto.getNameRu());
		return "Category updated successfully";
	}

	// delete a category by id
	// returns a string and accepts an id
	@Transactional
	public String deleteCategory(Long id) {
		// Получаем категорию из БД
		Category category = categoryRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("Category not found"));

		// Если есть связанные продукты — очищаем их
		if (!category.getProducts().isEmpty()) {
			category.getProducts().forEach(productRepository::delete);
		}

		// Удаляем саму категорию
		categoryRepo.delete(category);

		// Логируем удаление по русскому названию
		ActivityLogs.addEntry("category deleted: " + category.getNameRu());

		return "Category deleted successfully";
	}


	public Response uploadCategories(MultipartFile file) {
		Response response = new Response();
		List<CategoryDto> validCategories = new ArrayList<>();
		Map<String, Object> errors = new HashMap<>();

		if (file.isEmpty() || !file.getOriginalFilename().endsWith(".csv")) {
			response.setStatus(400);
			response.setMessage("Uploaded file is empty or not a CSV");
			return response;
		}

		try (var reader = new InputStreamReader(
				file.getInputStream(),
				StandardCharsets.UTF_8// если CSV в CP1251
		);
			 var csvParser = CSVFormat.DEFAULT
					 .withFirstRecordAsHeader()
					 .parse(reader)) {

			int row = 1;
			for (CSVRecord record : csvParser) {
				row++;
				CategoryDto dto = CategoryDto.builder()
						.nameKk(record.get("name_kk").trim())
						.nameRu(record.get("name_ru").trim())
						.descriptionKk(record.get("description_kk").trim())
						.descriptionRu(record.get("description_ru").trim())
						.build();

				// валидация DTO
				var violations = validator.validate(dto);
				if (!violations.isEmpty()) {
					int finalRow = row;
					violations.forEach(v ->
							errors.put("row " + finalRow, v.getMessage())
					);
					continue;
				}

				// проверка дублей по nameKk или nameRu
				boolean exists = categoryRepo.findByNameKk(dto.getNameKk()).isPresent()
						|| categoryRepo.findByNameRu(dto.getNameRu()).isPresent();
				if (exists) {
					errors.put("row " + row,
							"Category already exists: " + dto.getNameRu());
					continue;
				}

				validCategories.add(dto);
			}

			if (!errors.isEmpty()) {
				response.setStatus(400);
				response.setMessage("Validation failed");
				response.setErrors(errors);
				return response;
			}

			// сохраняем все валидные категории
			List<Category> entities = validCategories.stream()
					.map(d -> Category.builder()
							.nameKk(d.getNameKk())
							.nameRu(d.getNameRu())
							.descriptionKk(d.getDescriptionKk())
							.descriptionRu(d.getDescriptionRu())
							.build())
					.toList();
			categoryRepo.saveAll(entities);

		} catch (Exception e) {
			response.setStatus(400);
			response.setMessage("Error parsing CSV: " + e.getMessage());
			return response;
		}

		response.setStatus(200);
		response.setMessage("Categories uploaded successfully");
		ActivityLogs.addEntry("Multiple categories added");
		return response;
	}

}
