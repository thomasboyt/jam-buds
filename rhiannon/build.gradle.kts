buildscript {
    repositories {
        jcenter()
    }
}

plugins {
    kotlin("jvm") version "1.4.31"
    application
    id("org.flywaydb.flyway") version "6.1.4"
    id("com.google.cloud.tools.jib") version "2.5.0"
    id("org.jlleitschuh.gradle.ktlint") version "9.4.0"
    id("io.swagger.core.v3.swagger-gradle-plugin") version "2.1.6"
}

group = "club.jambuds"

repositories {
    mavenLocal()
    jcenter()
}

dependencies {
    implementation(kotlin("stdlib"))

    val javalinVersion = "3.12.0"
    implementation("io.javalin:javalin:$javalinVersion")
    implementation("io.javalin:javalin-openapi:$javalinVersion")
    implementation("com.typesafe:config:1.4.0")
    val jacksonVersion = "2.12.2"
    implementation("com.fasterxml.jackson.core:jackson-databind:$jacksonVersion")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:$jacksonVersion")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:$jacksonVersion")

    // swagger/openapi
    val swaggerVersion = "2.1.6"
    implementation("io.swagger.core.v3:swagger-annotations:$swaggerVersion")
    implementation("io.swagger.core.v3:swagger-core:$swaggerVersion")
    implementation("io.swagger.core.v3:swagger-models:$swaggerVersion")
    implementation("org.webjars:swagger-ui:3.24.3")

    // email stuff
    implementation("io.pebbletemplates:pebble:3.1.4")
    implementation("com.sendgrid:sendgrid-java:4.6.4")

    // validation
    implementation("org.hibernate.validator:hibernate-validator:6.1.2.Final")
    implementation("org.glassfish:javax.el:3.0.0")

    // third-party apis
    implementation("se.michaelthelin.spotify:spotify-web-api-java:4.2.1")
    val retrofitVersion = "2.7.1"
    implementation("com.squareup.retrofit2:retrofit:$retrofitVersion")
    implementation("com.squareup.retrofit2:converter-jackson:$retrofitVersion")
    implementation("com.squareup.retrofit2:converter-scalars:$retrofitVersion")
    implementation("org.jsoup:jsoup:1.13.1")

    // used for third party api auth (twitter, apple music)
    implementation("com.auth0:java-jwt:3.10.0")
    val bouncycastleVersion = "1.68"
    implementation("org.bouncycastle:bcprov-jdk15on:$bouncycastleVersion")
    implementation("org.bouncycastle:bcpkix-jdk15on:$bouncycastleVersion")

    // logging & monitoring
    implementation("ch.qos.logback:logback-classic:1.2.3")
    implementation("io.sentry:sentry-logback:4.3.0")
    implementation("com.newrelic.agent.java:newrelic-api:5.14.0")

    // database access
    val jdbiVersion = "3.12.0"
    implementation("org.jdbi:jdbi3-core:$jdbiVersion")
    implementation("org.jdbi:jdbi3-postgres:$jdbiVersion")
    implementation("org.jdbi:jdbi3-sqlobject:$jdbiVersion")
    implementation("org.jdbi:jdbi3-kotlin:$jdbiVersion")
    implementation("org.jdbi:jdbi3-kotlin-sqlobject:$jdbiVersion")
    implementation("org.postgresql:postgresql:42.2.9")
    implementation("com.zaxxer:HikariCP:3.4.2")
    implementation("io.lettuce:lettuce-core:5.2.2.RELEASE")

    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.5.0")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.5.0")
    testImplementation("com.konghq:unirest-java:3.4.03")
    testImplementation("org.flywaydb:flyway-core:6.1.4")
    testImplementation("org.mockito:mockito-core:3.2.4")
    testImplementation("com.nhaarman.mockitokotlin2:mockito-kotlin:2.2.0")
}

application {
    mainClass.set("club.jambuds.ApplicationKt")
}

java {
    sourceCompatibility = JavaVersion.VERSION_11
}

flyway {
    url = "jdbc:postgresql://localhost:5433/jambuds"
    user = "postgres"
    password = ""
}

jib {
    from {
        image = "azul/zulu-openjdk-alpine:11.0.6"
    }
    container {
        mainClass = "club.jambuds.ApplicationKt"
        // TODO: use runtime env var for this?
        jvmFlags = listOf(
            "-XX:+UseG1GC",
            "-Xmx100m",
            "-XX:+UseStringDeduplication"
        )
    }
}

// TODO
// ktlint {
//     verbose.set(true)
// }

tasks.distZip {
    enabled = false
}

tasks.distTar {
    enabled = false
}

tasks.test {
    environment("JAMBUDS_ENV", "test")
    useJUnitPlatform()
    testLogging {
        showExceptions = true
        showStackTraces = true
        showStandardStreams = true
        // events = "failed"
        // exceptionFormat = "full"
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "11"
    }
}

