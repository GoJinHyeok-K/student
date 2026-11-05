package com.example.eduhub.common.web;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 * 페이지 응답. Spring의 {@link Page}를 그대로 내보내지 않고 필요한 값만 담는다 (NFR-04).
 *
 * @param content 현재 페이지의 항목
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 크기
 * @param totalElements 전체 항목 수
 */
public record PageResponse<T>(List<T> content, int page, int size, long totalElements) {

  public static <T> PageResponse<T> from(Page<T> page) {
    return new PageResponse<>(
        page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements());
  }
}
