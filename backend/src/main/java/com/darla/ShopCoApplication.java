package com.darla;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShopCoApplication {
	public static void main(String[] args) {
		SpringApplication.run(ShopCoApplication.class, args);
		System.out.println("SHOP.CO Application is running! darlastores.com/v2.1");
	}
}
