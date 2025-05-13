package com.darla.service;

import java.time.Duration;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class OtpService {
	@Autowired
	private StringRedisTemplate redisTemplate;

	public void storeOtpInRedis(String email, String otp) {
		// OTP-ны Redis-те 5 минуттық TTL (өмір сүру мерзімі) орнатумен сақтау
		redisTemplate.opsForValue().set(email, otp, Duration.ofMinutes(5));
		System.out.println("OTP Redis-те сақталды, email: " + email);
	}

	public boolean isOtpValid(String email, String otp) {
		String storedOtp = redisTemplate.opsForValue().get(email);
		return storedOtp != null && storedOtp.equals(otp);
	}

	// 6 саннан тұратын OTP генерациялау
	public String generateOtp() {
		Random random = new Random();
		int val = 100000 + random.nextInt(900000);
		return String.valueOf(val);
	}
}
