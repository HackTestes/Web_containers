#!/usr/bin/bash

TEST_SEPARATOR=".....................................";
C_CPP_BENCHMARKS_PATH='/media/caioh/EXTERNAL_HDD1/TCC_CAIO/site_testes_pequenos_performance/C_CPP_Benchmarks/executable_dir';
PROGRAM='return_0.exe';
SYSCALLS='rt_sigaction,uname,arch_prctl,mmap,execve,rseq,rt_sigprocmask,prlimit64,brk,ioctl,mprotect,set_robust_list,write,munmap,readlink,futex,madvise,clone3,set_tid_address,getrandom,newfstatat,exit_group,exit'
SYSCALLS_SPACE_SEP=$(echo ${SYSCALLS} | tr ',' ' ')

# System info
uname -a;
lscpu;

printf '\n\n-------------------------------- TEST START --------------------------------\n\n\n'

function Test_Perf()
{
    printf "\ntime\n";
    /usr/bin/bash -c "time $1 >/dev/null";

    echo "${TEST_SEPARATOR}"

    printf "\n/usr/bin/time\n";
    /usr/bin/bash -c "/usr/bin/time -v $1 >/dev/null";

    echo "${TEST_SEPARATOR}"

    printf '\ndate +%%s%%N\n';
    COMMAND='START=$(date +%s%N) && '$1' &>/dev/null ; END=$(date +%s%N) && printf " nanoseconds:$((END - START))ns \n picoseconds:$(((END - START) / 1000))us \n miliseconds:$(((END - START) / 1000000))ms"'
    /usr/bin/bash -c "${COMMAND}";
}

function Test_Program()
{
    echo "Command: $1";
    echo "${TEST_SEPARATOR}"
    echo "Test program: $2";
    echo "${TEST_SEPARATOR}"
    echo "Args: $3";
    echo "${TEST_SEPARATOR}"
    echo "Test type: $4";
    echo "${TEST_SEPARATOR}"

    # Verify what kind of program/test is
    case $4 in
        "security")
            /usr/bin/bash -c "$1 2>/dev/null"; ;;
        "native")
            Test_Perf "$1"; ;;
        "speed")
            Test_Perf "$1"; ;;
        "syscall")
            /usr/bin/bash -c "strace -qfc -U syscall $1 >/dev/null"; ;;
        *)
        echo "WRONG TEST TYPE!";
    esac

    printf '\n\n//-----------------------------------------------------------------------------//\n\n';
}

# Args and programs have corresponding indexes -- program[0] args[0]
PROGRAMS_TO_EXECUTE+=('return_0.exe');
PROGRAMS_ARGS+=('');

PROGRAMS_TO_EXECUTE+=('cpu_single_thread_no_op_loop.exe');
PROGRAMS_ARGS+=('1000000');

PROGRAMS_TO_EXECUTE+=('prime_number.exe');
PROGRAMS_ARGS+=('919393');

PROGRAMS_TO_EXECUTE+=('prime_number.exe');
PROGRAMS_ARGS+=('2147483647');

PROGRAMS_TO_EXECUTE+=('matrix_addition_single_multi.exe');
PROGRAMS_ARGS+=('10000 10 1 multi');

PROGRAMS_TO_EXECUTE+=('cpu_multi_thread_no_op_loop.exe');
PROGRAMS_ARGS+=('1000000000 12');

PROGRAMS_TO_EXECUTE+=('prime_number_multi.exe');
PROGRAMS_ARGS+=('2147483647 12');

PROGRAMS_TO_EXECUTE+=('fibonnaci_multi.exe');
PROGRAMS_ARGS+=('999999999 12');


SECURITY_PROGRAM_ARG='--print';
SECURITY_PROGRAM_TEST="capsh";
SECURITY_CONFIG="'${SECURITY_PROGRAM_TEST}' '${SECURITY_PROGRAM_ARG}'"

# Speed, native and syscalls tests
for VAR in ${!PROGRAMS_TO_EXECUTE[@]}
do

    CURRENT_PROGRAM_CONFIG="'${PROGRAMS_TO_EXECUTE[VAR]}' '${PROGRAMS_ARGS[VAR]}'";

    # Native
    Test_Program "${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "native"
    Test_Program "${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "syscall"

    # Namespaced/containerized
    Test_Program "unshare -muinpUCT --fork --map-current-user -R ${C_CPP_BENCHMARKS_PATH} /${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";

    Test_Program "unshare -muinpUCT --fork --map-root-user setpriv --nnp --securebits +noroot,+noroot_locked,+no_setuid_fixup_locked,+keep_caps_locked ${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";

    Test_Program "setpriv --nnp unshare -muinpUCT --fork --map-current-user -R ${C_CPP_BENCHMARKS_PATH} /${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";

    Test_Program "podman run --rm -ti --volume ${C_CPP_BENCHMARKS_PATH}:/ --entrypoint /${PROGRAMS_TO_EXECUTE[VAR]} empty_container ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";

    Test_Program "bwrap --new-session --unshare-all --cap-drop all --ro-bind ${C_CPP_BENCHMARKS_PATH} / /${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";

    Test_Program "systemd-run --user --wait --collect -p 'NoNewPrivileges=true' -p 'MemoryDenyWriteExecute=true' -p 'PrivateUsers=true' -p 'SecureBits= keep-caps-locked no-setuid-fixup-locked noroot noroot-locked' -p 'CapabilityBoundingSet=' -p 'AmbientCapabilities=' ${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";

    Test_Program "systemd-run --user --wait --collect -p 'SystemCallFilter=${SYSCALLS_SPACE_SEP}' -p 'NoNewPrivileges=true' -p 'MemoryDenyWriteExecute=true' -p 'PrivateUsers=true' -p 'SecureBits= keep-caps-locked no-setuid-fixup-locked noroot noroot-locked' -p 'CapabilityBoundingSet=' -p 'AmbientCapabilities=' ${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";

    # My implementation
    #Test_Program "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp --host-filesystem --no-seccomp ${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";

    Test_Program "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp --unshare all --fork --host-filesystem --no-seccomp ${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";

    Test_Program "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp --unshare all --fork --no-seccomp --pivot-root ${C_CPP_BENCHMARKS_PATH} /${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";

    Test_Program "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp --unshare all --fork --seccomp-syscalls ${SYSCALLS} --pivot-root ${C_CPP_BENCHMARKS_PATH} /${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" "speed";
done

# Security configuration tests
Test_Program "unshare -muinpUCT --fork --map-root-user setpriv --nnp --securebits +noroot,+noroot_locked,+no_setuid_fixup_locked,+keep_caps_locked ${SECURITY_PROGRAM_TEST} ${SECURITY_PROGRAM_ARG}" ${SECURITY_CONFIG} "security";
Test_Program "systemd-run --user -P --wait -p 'NoNewPrivileges=true' -p 'MemoryDenyWriteExecute=true' -p 'PrivateUsers=true' -p 'SecureBits= keep-caps-locked no-setuid-fixup-locked noroot noroot-locked' -p 'CapabilityBoundingSet=' -p 'AmbientCapabilities=' ${SECURITY_PROGRAM_TEST} ${SECURITY_PROGRAM_ARG}" ${SECURITY_CONFIG} "security";
Test_Program "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp --unshare all --fork --host-filesystem --no-seccomp ${SECURITY_PROGRAM_TEST} ${SECURITY_PROGRAM_ARG}" ${SECURITY_CONFIG} "security";