package com.openclassrooms.starterjwt.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.openclassrooms.starterjwt.repository")
@EnableTransactionManagement
public class YogaJpaConfig {
}
