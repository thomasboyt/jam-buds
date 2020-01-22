FROM openjdk:8-jre-alpine

ENV APPLICATION_USER ktor
RUN adduser -D -g "" $APPLICATION_USER

RUN mkdir /app
RUN chown -R $APPLICATION_USER /app

USER $APPLICATION_USER

COPY ./build/libs/jambuds-rhiannon.jar /app/jambuds-rhiannon.jar
WORKDIR /app

# uhhh
CMD ["java", "-server", "-XX:+UnlockExperimentalVMOptions", "-XX:+UseCGroupMemoryLimitForHeap", "-XX:InitialRAMFraction=2", "-XX:MinRAMFraction=2", "-XX:MaxRAMFraction=2", "-XX:+UseG1GC", "-XX:MaxGCPauseMillis=100", "-XX:+UseStringDeduplication", "-jar", "jambuds.jar"]