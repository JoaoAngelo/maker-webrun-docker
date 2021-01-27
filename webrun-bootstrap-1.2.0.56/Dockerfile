FROM tomcat:9-jdk8-openjdk-buster

LABEL maintainer="João Ângelo <joaoangelo92@gmail.com>" version="1.2.0.56"

ENV CONTEXT_NAME=ROOT
ENV WEBRUN_HOME=$CATALINA_HOME/webrun

RUN apk add --no-cache tzdata

ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR $CATALINA_HOME

COPY . .

EXPOSE 8080
CMD ["catalina.sh", "run"]