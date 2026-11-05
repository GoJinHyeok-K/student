package com.example.eduhub.common.health;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 서버가 요청을 받을 수 있는지 확인한다. Repository를 쓰지 않으므로 Service를 두지 않는다. */
@Tag(name = "Health", description = "서버 상태 확인")
@RestController
@RequestMapping("/api/health")
public class HealthController {

  @Operation(summary = "서버 상태 확인")
  @GetMapping
  public HealthResponse health() {
    return HealthResponse.up();
  }
}
