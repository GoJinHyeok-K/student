package com.example.eduhub.common.exception;

/** 현재 상태에서 할 수 없는 요청일 때 던진다 (예: 종료된 과정 수정). {@link GlobalExceptionHandler}가 409로 바꾼다. */
public class ConflictException extends RuntimeException {

  public ConflictException(String message) {
    super(message);
  }
}
