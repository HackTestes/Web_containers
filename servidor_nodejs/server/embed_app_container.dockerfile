FROM scratch
USER 1000:1000
COPY apps/Test_app/bin/AppExecutable /app_container/AppExecutable
CMD ["/app_container/AppExecutable"]