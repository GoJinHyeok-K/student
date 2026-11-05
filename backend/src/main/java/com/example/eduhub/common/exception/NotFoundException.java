package com.example.eduhub.common.exception;

/** 요청한 리소스가 없을 때 던진다. {@link GlobalExceptionHandler}가 404로 바꾼다. */
public class NotFoundException extends RuntimeException {

  public NotFoundException(String message) {
    super(message);
  }
}
