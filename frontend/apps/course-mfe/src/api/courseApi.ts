import { Configuration, CourseAdminApi, CourseApi } from '@eduhub/api-client';

// 생성된 클라이언트의 인스턴스는 여기 한 곳에서만 만든다 (Axios를 직접 생성하지 않는다)
// basePath '': 개발 서버 프록시(vite.config.ts)가 /api 요청을 백엔드로 넘긴다
const configuration = new Configuration({ basePath: '' });

export const courseApi = new CourseApi(configuration);

/** 관리자용 과정·회차 등록, 수정, 종료 (FR-03) */
export const courseAdminApi = new CourseAdminApi(configuration);
