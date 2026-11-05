# frontend/CLAUDE.md

React 18 + TypeScript 프론트엔드(아직 코드 없음). 저장소 공통 규칙은 루트 `CLAUDE.md`를 따른다.

- UI 컴포넌트는 MUI를 쓴다
- API 호출은 백엔드 OpenAPI 스펙(`/api-docs`)에서 생성한 Axios 클라이언트로 한다 (NFR-04)
- 서버 데이터 조회는 커스텀 훅(`src/hooks/useXxx.ts`)으로 감싼다
- 화면 컴포넌트는 API를 직접 부르지 않고 커스텀 훅을 쓴다
