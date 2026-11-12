package com.example.eduhub.course.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * 회차 등록·수정 요청 (FR-03). 정원 상한은 D-10.
 *
 * @param startDate 시작일 (yyyy-MM-dd)
 */
public record SessionRequest(
    @Schema(example = "2026-12-01") @NotNull LocalDate startDate,
    @Schema(example = "본사 3층 교육장") @NotBlank @Size(max = 100) String place,
    @Schema(example = "20") @NotNull @Min(1) @Max(1000) Integer capacity) {

  /** 앞뒤 공백을 지운 장소 */
  public String trimmedPlace() {
    return place.strip();
  }
}
