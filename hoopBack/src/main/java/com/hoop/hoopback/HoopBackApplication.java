package com.hoop.hoopback;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HoopBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(HoopBackApplication.class, args);
    }

}
