FROM azul/zulu-openjdk-alpine:11.0.6

ENV APPLICATION_USER app
RUN adduser -D -g "" $APPLICATION_USER

RUN mkdir /app
RUN chown -R $APPLICATION_USER /app

USER $APPLICATION_USER

COPY ./build/libs/jambuds-rhiannon.jar /app/jambuds-rhiannon.jar
COPY ./bin /app/bin
COPY ./src/main/resources/db/migration /app/migrations
WORKDIR /app

# TODO: figure out if this is all legit
CMD "./bin/docker_entrypoint.sh"