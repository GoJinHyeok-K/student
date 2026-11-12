package com.example.eduhub.course.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 과정 등록·수정 요청 (FR-03). 길이 제한은 V1 마이그레이션의 컬럼 길이와 같다.
 *
 * @param description 과정 소개 (생략 가능)
 */
public record CourseRequest(
    @Schema(example = "JPA 기초") @NotBlank @Size(max = 200) String title,
    @Schema(example = "개발") @NotBlank @Size(max = 50) String category,
    @Schema(example = "엔티티 매핑과 연관관계") String description) {

  /** 앞뒤 공백을 지운 제목 */
  public String trimmedTitle() {
    return title.strip();
  }

  /** 앞뒤 공백을 지운 분류 */
  public String trimmedCategory() {
    return category.strip();
  }

  /** 비어 있으면 null로 바꾼 소개 */
  public String normalizedDescription() {
    return description == null || description.isBlank() ? null : description.strip();
  }
}
