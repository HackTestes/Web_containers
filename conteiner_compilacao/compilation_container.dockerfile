FROM docker.io/ubuntu:latest as origin

RUN apt -y update && apt -y upgrade 
RUN apt install -y make gcc g++ zip 
USER 1000:1000
COPY build_executable.sh /container/
COPY makefile_internal_container_build /container/
WORKDIR /container
CMD ["./build_executable.sh"]