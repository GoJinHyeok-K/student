package com.example.eduhub.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** NFR-04: OpenAPI 문서 정보. 프론트 클라이언트는 이 스펙(/api-docs)에서 생성한다. */
@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI eduhubOpenApi() {
    return new OpenAPI()
        .info(
            new Info()
                .title("EduHub API")
                .description("사내 교육과정 조회 및 수강 신청 API")
                .version("v1"));
  }
}
