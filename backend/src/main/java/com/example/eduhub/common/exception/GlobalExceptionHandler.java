package com.example.eduhub.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 애플리케이션 예외를 ProblemDetail(RFC 9457) 응답으로 바꾼다.
 *
 * <p>잘못된 파라미터 같은 Spring MVC 표준 예외는 {@code spring.mvc.problemdetails.enabled}가 처리한다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(NotFoundException.class)
  public ProblemDetail handleNotFound(NotFoundException ex) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
  }
}
