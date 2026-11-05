plugins {
    // JDK 21이 없으면 Gradle이 자동으로 받아 온다 (툴체인 자동 설치)
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

rootProject.name = "eduhub-backend"
