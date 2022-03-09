
# Compile and build cBPF filter
gcc ./seccomp_filter.c -o ./generate_seccomp_exe -lseccomp && ./generate_seccomp_exe > ./my_bpf_filter.bpf

# Query the logs
journalctl | grep SECCOMP | grep -v "chrome"

# Execute under bwrap
time bwrap --unshare-all --ro-bind ../servidor_nodejs/server/apps/Caio_Test_Web_App/bin/ / --seccomp 10 10<./my_bpf_filter.bpf --as-pid-1 /AppExecutable
