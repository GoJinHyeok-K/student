package com.example.eduhub;

import static com.tngtech.archunit.core.domain.properties.CanBeAnnotated.Predicates.annotatedWith;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noMethods;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import jakarta.persistence.Entity;
import org.springframework.data.repository.Repository;
import org.springframework.web.bind.annotation.RestController;

/**
 * 팀 규칙과 NFR-07을 테스트로 검사한다. 아직 클래스가 없는 규칙도 통과하도록 allowEmptyShould(true)를
 * 둔다.
 */
@AnalyzeClasses(
    packages = "com.example.eduhub",
    importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

  private static final String COURSE = "com.example.eduhub.course..";
  private static final String ENROLLMENT = "com.example.eduhub.enrollment..";
  private static final String COMMON = "com.example.eduhub.common..";

  @ArchTest
  static final ArchRule CONTROLLERS_DO_NOT_USE_REPOSITORIES =
      noClasses()
          .that()
          .areAnnotatedWith(RestController.class)
          .should()
          .dependOnClassesThat()
          .areAssignableTo(Repository.class)
          .orShould()
          .dependOnClassesThat()
          .areAnnotatedWith(org.springframework.stereotype.Repository.class)
          .allowEmptyShould(true)
          .because("Controller는 Service를 통해서만 Repository를 쓴다");

  // 반환 타입이 엔티티인 경우만 잡는다. ResponseEntity<엔티티>, List<엔티티>는 리뷰로 확인한다.
  @ArchTest
  static final ArchRule CONTROLLERS_DO_NOT_RETURN_ENTITIES =
      noMethods()
          .that()
          .areDeclaredInClassesThat()
          .areAnnotatedWith(RestController.class)
          .should()
          .haveRawReturnType(annotatedWith(Entity.class))
          .allowEmptyShould(true)
          .because("API 응답은 엔티티 대신 DTO를 쓴다");

  @ArchTest
  static final ArchRule COURSE_DOES_NOT_DEPEND_ON_ENROLLMENT =
      noClasses()
          .that()
          .resideInAPackage(COURSE)
          .should()
          .dependOnClassesThat()
          .resideInAPackage(ENROLLMENT)
          .allowEmptyShould(true)
          .because("enrollment는 course를 참조할 수 있지만 반대는 금지한다");

  @ArchTest
  static final ArchRule COMMON_DOES_NOT_DEPEND_ON_DOMAINS =
      noClasses()
          .that()
          .resideInAPackage(COMMON)
          .should()
          .dependOnClassesThat()
          .resideInAnyPackage(COURSE, ENROLLMENT)
          .allowEmptyShould(true)
          .because("common은 어느 도메인에도 의존하지 않는다");
}
