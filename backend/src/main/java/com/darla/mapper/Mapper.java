package com.darla.mapper;

import com.darla.dto.*;
import com.darla.entity.*;
import com.darla.entity.Product;

import java.util.Locale;

public class Mapper {


	public static UserDto mapToUserDto(User user) {
		return UserDto.builder()
				.id(user.getId())
				.name(user.getName())
				.email(user.getEmail())
				.role(user.getRole())
				.phoneNumber(user.getPhoneNumber())
				.street(user.getStreet())
				.city(user.getCity())
				.district(user.getDistrict())
				.zipCode(user.getZipCode())
				.state(user.getState())
				.country(user.getCountry())
				.createdAt(user.getCreatedAt())

				.build();
	}
	public static ProductDto mapToProductDto(Product p, Locale locale) {
		String lang = locale.getLanguage();
		String categoryName = "kk".equals(lang)
				? p.getCategory().getNameKk()
				: p.getCategory().getNameRu();

		return ProductDto.builder()
				.id(p.getId())
				.name(p.getName())
				.description(p.getDescription())
				.price(p.getPrice())
				.stock(p.getStock())
				.brand(p.getBrand())
				.colors(p.getColors())
				.sizes(p.getSizes())
				.categoryId(p.getCategory().getId())
				.category(categoryName)
				.imageName(p.getImageName())
				.imageData(p.getImageData())
				.build();
	}
}
