package com.empowerly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@EnableMongoAuditing
public class EmpowerlyApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmpowerlyApplication.class, args);
    }
}
