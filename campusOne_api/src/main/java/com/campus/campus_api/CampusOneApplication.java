package com.campus.campus_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CampusOneApplication {

	public static void main(String[] args) {
		SpringApplication.run(CampusOneApplication.class, args);
	}

}
