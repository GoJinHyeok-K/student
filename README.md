# EduHub

사내 교육 과정 조회 및 수강 신청 시스템
  

## 폴더 구조
- `backend/`: Spring Boot API 서버
- `docs/requirements.md`: 요구사항과 결정 사항
- `CLAUDE.md`: 팀 작업 규칙

## 백엔드 실행
1. JDK 21을 준비한다 (없으면 Gradle 툴체인이 자동으로 받는다)
2. 저장소 루트에서 `.env.example`을 복사해 `.env`를 만들고 값을 채운다
3. `cd backend`
4. 테스트: `./gradlew test` (PowerShell은 `.\gradlew test`)
5. 실행: `./gradlew bootRun` (기본 프로필 dev)
6. 확인: http://localhost:8080/api/health , http://localhost:8080/swagger-ui.html
