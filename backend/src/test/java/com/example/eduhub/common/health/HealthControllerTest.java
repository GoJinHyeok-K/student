package com.example.eduhub.common.health;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest(HealthController.class)
class HealthControllerTest {

  @Autowired private MockMvcTester mvc;

  @Test
  @DisplayName("GET /api/health 는 200과 status UP을 돌려준다")
  void returnsUp() {
    assertThat(mvc.get().uri("/api/health"))
        .hasStatusOk()
        .bodyJson()
        .isLenientlyEqualTo("{\"status\":\"UP\"}");
  }
}
