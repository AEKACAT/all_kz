package com.darla.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.darla.dto.Response;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.darla.dto.OrderDto;
import com.darla.dto.ProductDto;
import com.darla.dto.ProductsDto;
import com.darla.entity.Category;
import com.darla.entity.Product;
import com.darla.exception_handling.NotFoundException;
import com.darla.mapper.Mapper;
import com.darla.repository.*;
import com.darla.entity.Carousel;
import com.darla.repository.CarouselRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Validator;

@Service
public class ProductService {

	private final ProductRepository productRepository;
	private final CategoryRepository categoryRepository;
	private final Validator validator;
	@Autowired
	private CarouselRepository carouselRepository;

	@Autowired
	private UserRepository userRepository;
	@Autowired
	private OrderRepository orderRepository;

	public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
			Validator validator) {
		this.productRepository = productRepository;
		this.categoryRepository = categoryRepository;
		this.validator = validator;
	}

	// fetch all products, only for admin
	@Transactional
	public Page<ProductDto> fetchAllProducts(int size, int page, Locale locale) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		return productRepository.findAll(pageable)
				.map(p -> Mapper.mapToProductDto(p, locale));
	}


	// fetch product by id
	@Transactional
	public ProductDto fetchProductById(Long id, Locale locale) {
		Product product = productRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Product with id " + id + " not found"));
		return Mapper.mapToProductDto(product, locale);
	}


	// add product, only for admin
	@Transactional
	public String addProduct(ProductDto dto, Locale locale) throws IOException {
		Optional<Category> category = locale.getLanguage().equals("kk")
				? categoryRepository.findByNameKk(dto.getCategory())
				: categoryRepository.findByNameRu(dto.getCategory());
		if (category.isEmpty()) {
			throw new NotFoundException("Category with name " + dto.getCategory() + " not found");
		}

		Product product = Product.builder()
				.name(dto.getName())
				.price(dto.getPrice())
				.description(dto.getDescription())
				.stock(dto.getStock())
				.rating(0.0)
				.brand(dto.getBrand())
				.colors(dto.getColors())
				.sizes(dto.getSizes())
				.imageName(dto.getImageFile().getOriginalFilename())
				.imageData(dto.getImageFile().getBytes())
				.category(category.get())
				.build();

		productRepository.save(product);
		ActivityLogs.addEntry("Product " + product.getName() + " added successfully");
		return "Product added successfully";
	}


	// delete product, only for admin
	public String deleteProduct(Long id) {
		productRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Product with id " + id + " not found"));
		productRepository.deleteById(id);
		ActivityLogs.addEntry("Product with id " + id + " deleted successfully");
		return "Product deleted successfully";
	}


	// fetch products by category
	@Transactional
	public Page<ProductDto> fetchProductsByCategory(String categoryName, int size, int page, Locale locale) {
		if (categoryName == null || categoryName.isEmpty()) {
			throw new NotFoundException("Category name cannot be null");
		}
		Optional<Category> category = locale.getLanguage().equals("kk")
				? categoryRepository.findByNameKk(categoryName)
				: categoryRepository.findByNameRu(categoryName);
		if (category.isEmpty()) {
			throw new NotFoundException("Category with name " + categoryName + " not found");
		}

		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		return productRepository.findByCategoryId(category.get().getId(), pageable)
				.map(p -> Mapper.mapToProductDto(p, locale));
	}


	// fetch products by search query
	@Transactional
	public List<ProductDto> fetchProductsBySearch(String query, Locale locale) {
		if (query == null || query.isEmpty()) {
			throw new NotFoundException("Search query cannot be null");
		}
		return productRepository.findBySearchQuery(query).stream()
				.map(p -> Mapper.mapToProductDto(p, locale))
				.collect(Collectors.toList());
	}


	@Transactional
	public String addMultipleProducts(List<ProductsDto> dtos, Locale locale) throws IOException {
		for (ProductsDto dto : dtos) {
			Optional<Category> category = locale.getLanguage().equals("kk")
					? categoryRepository.findByNameKk(dto.getCategory())
					: categoryRepository.findByNameRu(dto.getCategory());
			if (category.isEmpty()) {
				throw new NotFoundException("Category with name " + dto.getCategory() + " not found");
			}

			Product product = Product.builder()
					.name(dto.getName())
					.description(dto.getDescription())
					.price(dto.getPrice())
					.brand(dto.getBrand())
					.stock(dto.getStock())
					.rating(0.0)
					.colors(dto.getColors())
					.sizes(dto.getSizes())
					.imageName(Paths.get(dto.getImagePath()).getFileName().toString())
					.imageData(Files.readAllBytes(Paths.get(dto.getImagePath())))
					.category(category.get())
					.build();

			productRepository.save(product);
		}
		ActivityLogs.addEntry("Multiple products added");
		return "Products added successfully!";
	}



	@Transactional
	public String updateProduct(Long id,
								String name,
								String description,
								Double price,
								Integer stock,
								String brand,
								String colors,
								String sizes,
								String categoryName,
								MultipartFile imageFile,
								Locale locale) throws IOException {
		Product product = productRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Product not found"));

		if (name != null && !name.isBlank())        product.setName(name);
		if (description != null && !description.isBlank()) product.setDescription(description);
		if (price != null)                         product.setPrice(price);
		if (stock != null)                         product.setStock(stock);
		if (brand != null && !brand.isBlank())     product.setBrand(brand);
		if (colors != null && !colors.isBlank())   product.setColors(colors);
		if (sizes != null && !sizes.isBlank())     product.setSizes(sizes);

		if (categoryName != null && !categoryName.isBlank()) {
			Optional<Category> category = locale.getLanguage().equals("kk")
					? categoryRepository.findByNameKk(categoryName)
					: categoryRepository.findByNameRu(categoryName);
			if (category.isEmpty()) {
				throw new NotFoundException("Category not found: " + categoryName);
			}
			product.setCategory(category.get());
		}

		if (imageFile != null && !imageFile.isEmpty()) {
			product.setImageData(imageFile.getBytes());
			product.setImageName(imageFile.getOriginalFilename());
		}

		productRepository.save(product);
		ActivityLogs.addEntry("Product with id " + id + " updated successfully");
		return "Product updated successfully!";
	}


	// carousel-images functionalities
	// fetch all carousel images
	@Transactional
	public List<Carousel> fetchAllCarouselImages() {
		return carouselRepository.findAll();
	}


	// fetch carousel image by id
	@Transactional
	public String addNewCarouselImage(MultipartFile image) throws IOException {
		Carousel newImage = new Carousel();
		newImage.setImageName(image.getOriginalFilename());
		newImage.setImageData(image.getBytes());
		carouselRepository.save(newImage);
		ActivityLogs.addEntry("Жаңа карусель суреті сәтті қосылды");
		return "Сәтті қосылды..";
	}


	public String removeCarouselImage(Long id) {
		Carousel existing = carouselRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Сурет табылмады, id " + id));
		carouselRepository.deleteById(id);
		ActivityLogs.addEntry("Сурет " + id + " сәтті жойылды");
		return "Сурет сәтті жойылды " + existing.getImageName();
	}


	@Transactional
	public Map<String, Object> fetchMetrics() {
		Map<String, Object> metrics = new HashMap<>();
		metrics.put("totalProducts", productRepository.countProducts());
		metrics.put("totalUsers", userRepository.countUsers() - 1);
		metrics.put("totalOrders", orderRepository.countOrders());
		metrics.put("totalCategories", categoryRepository.countCategories());
		metrics.put("totalCarousels", carouselRepository.countCarousels());

		List<OrderDto> recentOrders = orderRepository
				.findRecentOrders(LocalDateTime.now().minusDays(7)).stream()
				.map(o -> OrderDto.builder()
						.id(o.getId())
						.userId(o.getUser().getId())
						.productId(o.getProduct().getId())
						.productName(o.getProduct().getName())
						.quantity(o.getQuantity())
						.totalAmount(o.getTotalAmount())
						.createdAt(o.getCreatedAt())
						.status(o.getStatus())
						.build())
				.collect(Collectors.toList());
		metrics.put("recentOrders", recentOrders);
		metrics.put("activities", ActivityLogs.deque);
		return metrics;
	}


	@Transactional
	public Map<String, List<ProductDto>> fetchShowcaseProducts(Locale locale) {
		String lang = locale.getLanguage();
		Map<String, List<ProductDto>> showcase = new LinkedHashMap<>();

		// Топ-10 продуктов
		List<ProductDto> topTen = productRepository.findTopTenProducts().stream()
				.map(p -> Mapper.mapToProductDto(p, locale))
				.collect(Collectors.toList());
		showcase.put("topTenProducts", topTen);

		// Категории с >5 продуктами
		List<Category> categories = categoryRepository.findCategoriesWithMoreThanFiveProductsNative();
		for (Category cat : categories) {
			String catName = "kk".equals(lang) ? cat.getNameKk() : cat.getNameRu();
			Pageable pg = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
			List<ProductDto> list = productRepository
					.findByCategoryId(cat.getId(), pg)
					.stream()
					.map(p -> Mapper.mapToProductDto(p, locale))
					.collect(Collectors.toList());
			showcase.put(catName, list);
		}
		return showcase;
	}


	@Transactional
	public Response uploadProducts(MultipartFile file, Locale locale) {
		Response resp = new Response();
		List<ProductsDto> valid = new ArrayList<>();
		Map<String, Object> errors = new HashMap<>();

		if (file.isEmpty() || !file.getOriginalFilename().endsWith(".csv")) {
			resp.setStatus(400);
			resp.setMessage("Uploaded file is empty or not a CSV");
			return resp;
		}

		try (var reader = new InputStreamReader(file.getInputStream());
			 var parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)) {

			int row = 1;
			for (CSVRecord record : parser) {
				row++;
				ProductsDto dto = ProductsDto.builder()
						.name(record.get("name").trim())
						.description(record.get("description").trim())
						.price(Double.parseDouble(record.get("price")))
						.brand(record.get("brand").trim())
						.stock(Integer.parseInt(record.get("stock")))
						.colors(record.get("colors").trim())
						.sizes(record.get("sizes").trim())
						.category(record.get("category").trim())
						.imagePath(record.get("imagePath").trim())
						.build();

				var violations = validator.validate(dto);
				if (!violations.isEmpty()) {
					final int currentRow = row;
					violations.forEach(v -> errors.put("row " + currentRow, v.getMessage()));
					continue;
				}

				Optional<Category> catOpt = locale.getLanguage().equals("kk")
						? categoryRepository.findByNameKk(dto.getCategory())
						: categoryRepository.findByNameRu(dto.getCategory());
				if (catOpt.isEmpty()) {
					errors.put("row " + row, "Category not found: " + dto.getCategory());
					continue;
				}

				valid.add(dto);
			}

			if (!errors.isEmpty()) {
				resp.setStatus(400);
				resp.setMessage("Validation failed");
				resp.setErrors(errors);
				return resp;
			}

			List<Product> prods = valid.stream().map(dto -> {
				byte[] imgData;
				String imgName;
				try {
					if (dto.getImagePath().startsWith("http")) {
						try (InputStream in = new URL(dto.getImagePath()).openStream()) {
							imgData = in.readAllBytes();
							imgName = Paths.get(new URI(dto.getImagePath()).getPath()).getFileName().toString();
						}
					} else {
						imgData = Files.readAllBytes(Paths.get(dto.getImagePath()));
						imgName = Paths.get(dto.getImagePath()).getFileName().toString();
					}
				} catch (Exception e) {
					throw new RuntimeException("Failed to read image: " + e.getMessage(), e);
				}

				Category cat = locale.getLanguage().equals("kk")
						? categoryRepository.findByNameKk(dto.getCategory()).get()
						: categoryRepository.findByNameRu(dto.getCategory()).get();

				return Product.builder()
						.name(dto.getName())
						.description(dto.getDescription())
						.price(dto.getPrice())
						.brand(dto.getBrand())
						.stock(dto.getStock())
						.rating(0.0)
						.colors(dto.getColors())
						.sizes(dto.getSizes())
						.imageData(imgData)
						.imageName(imgName)
						.category(cat)
						.build();
			}).collect(Collectors.toList());

			productRepository.saveAll(prods);

		} catch (Exception e) {
			resp.setStatus(400);
			resp.setMessage("Error parsing CSV: " + e.getMessage());
			return resp;
		}

		resp.setStatus(200);
		resp.setMessage("Products uploaded successfully");
		ActivityLogs.addEntry("Multiple Products added");
		return resp;
	}


}
