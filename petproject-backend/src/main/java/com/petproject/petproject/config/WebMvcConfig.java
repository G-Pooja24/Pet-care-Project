package com.petproject.petproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        
        // Handle images requested at root path (to match frontend behavior)
        registry.addResourceHandler("/*.png", "/*.jpg", "/*.jpeg")
                .addResourceLocations("file:uploads/");
    }
}
