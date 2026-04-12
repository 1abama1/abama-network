package com.hoop.hoopback.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {
    private List<String> allowedOrigins = List.of(
            "http://localhost:5174",
            "http://localhost:80",
            "http://localhost",
            "https://abama-network.onrender.com"
    );
}
