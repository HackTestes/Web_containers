FROM docker.io/ubuntu:latest as origin

RUN apt -y update && apt -y upgrade
RUN apt install -y make gcc g++
USER 1000:1000
COPY makefile_internal_container_build /container/
WORKDIR /container
CMD ["make", "-f", "makefile_internal_container_build"]


# FROM scratch
# USER 1000:1000
# COPY --from=origin / /
# WORKDIR /container
# CMD ["make", "-f", "makefile_internal_container_build"]