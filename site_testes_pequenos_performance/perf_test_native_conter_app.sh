#!/usr/bin/bash

TEST_SEPARATOR=".....................................";
C_CPP_BENCHMARKS_PATH='/media/caioh/EXTERNAL_HDD1/TCC_CAIO/site_testes_pequenos_performance/C_CPP_Benchmarks/executable_dir';
SYSCALLS='rt_sigaction,uname,arch_prctl,mmap,execve,rseq,rt_sigprocmask,prlimit64,brk,ioctl,mprotect,set_robust_list,write,munmap,readlink,futex,madvise,clone3,set_tid_address,getrandom,newfstatat,exit_group,exit'
SYSCALLS_SPACE_SEP=$(echo ${SYSCALLS} | tr ',' ' ')

# System info
#uname -a;
#lscpu;

sleep 5;

printf '\n\n-------------------------------- TEST START --------------------------------\n\n\n'

function Test_Program()
{
    EXE_COMMAND=$1;
    ALIAS=$2;
    TEST_PROGRAM=$3;
    ARGS=$4;
    TYPE=$5;
    LOOP_SIZE=$6;

    printf "Test ${ALIAS} - ${TEST_PROGRAM}\n"

    COMMAND='START=$(date +%s%N) && '$1' &>/dev/null ; END=$(date +%s%N) && printf "$((END - START))"';
    EXIT_CODE=1;
    NANOSECOND="";
    MICROSECOND="";
    MILISECOND="";
    for ((i = 0; i < ${LOOP_SIZE}; i++));
    do
        printf "Loop: $i\n";
        RESULT_COMMAND=$(/usr/bin/bash -c "${COMMAND}");
        EXIT_CODE=$?;
        NANOSECOND+="$((RESULT_COMMAND)) "
        MICROSECOND+="$(((RESULT_COMMAND) / 1000)) "
        MILISECOND+="$(((RESULT_COMMAND) / 1000000)) "
    done

    printf "${EXE_COMMAND}\t${ALIAS}\t${TEST_PROGRAM}\t${ARGS}\t${TYPE}\t${EXIT_CODE}\t${NANOSECOND}\t${MICROSECOND}\t${MILISECOND}\t0\n" >>'Perf_results.tsv'
}

TESTS_NUMBER_OF_EXECUTIONS=20;

# Args and programs have corresponding indexes -- program[0] args[0]
PROGRAMS_TO_EXECUTE+=('return_0.exe');
PROGRAMS_ARGS+=('');
PROGRAM_TIMES_TO_EXECUTE+=(200);

PROGRAMS_TO_EXECUTE+=('bubble_sort.exe');
PROGRAMS_ARGS+=('10000');
PROGRAM_TIMES_TO_EXECUTE+=($TESTS_NUMBER_OF_EXECUTIONS);

PROGRAMS_TO_EXECUTE+=('linear_search.exe');
PROGRAMS_ARGS+=('10000000');
PROGRAM_TIMES_TO_EXECUTE+=($TESTS_NUMBER_OF_EXECUTIONS);

PROGRAMS_TO_EXECUTE+=('single_thread_no_op_loop.exe');
PROGRAMS_ARGS+=('1000000000');
PROGRAM_TIMES_TO_EXECUTE+=($TESTS_NUMBER_OF_EXECUTIONS);

PROGRAMS_TO_EXECUTE+=('prime_number.exe');
PROGRAMS_ARGS+=('919393');
PROGRAM_TIMES_TO_EXECUTE+=($TESTS_NUMBER_OF_EXECUTIONS);

PROGRAMS_TO_EXECUTE+=('prime_number.exe');
PROGRAMS_ARGS+=('2147483647');
PROGRAM_TIMES_TO_EXECUTE+=($TESTS_NUMBER_OF_EXECUTIONS);

PROGRAMS_TO_EXECUTE+=('matrix_addition_single_multi.exe');
PROGRAMS_ARGS+=('10000 10 1 multi');
PROGRAM_TIMES_TO_EXECUTE+=($TESTS_NUMBER_OF_EXECUTIONS);

PROGRAMS_TO_EXECUTE+=('multi_thread_no_op_loop.exe');
PROGRAMS_ARGS+=('1000000000 6');
PROGRAM_TIMES_TO_EXECUTE+=($TESTS_NUMBER_OF_EXECUTIONS);

PROGRAMS_TO_EXECUTE+=('prime_number_multi.exe');
PROGRAMS_ARGS+=('2147483647 6');
PROGRAM_TIMES_TO_EXECUTE+=($TESTS_NUMBER_OF_EXECUTIONS);

PROGRAMS_TO_EXECUTE+=('fibonnaci_multi.exe');
PROGRAMS_ARGS+=('999999999 6');
PROGRAM_TIMES_TO_EXECUTE+=($TESTS_NUMBER_OF_EXECUTIONS);

TEST_FILE='Testes_de_inicializacao.tsv'
printf 'Command\tAlias\tTest_program\tArgs\tType\tExit_code\tNanoseconds\tMicroseconds\tMiliseconds\tRuntime_startup_time_miliseconds\n' >'Perf_results.tsv'

# Startup tests

# Native
#Test_Program "${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[0]} ${PROGRAMS_ARGS[0]}" "${PROGRAMS_TO_EXECUTE[0]}" "${PROGRAMS_ARGS[0]}" 'native' ${PROGRAM_TIMES_TO_EXECUTE[0]};

# Namespaced/containerized
Test_Program "unshare -muinpUCT --fork --map-current-user -R ${C_CPP_BENCHMARKS_PATH} /${PROGRAMS_TO_EXECUTE[0]} ${PROGRAMS_ARGS[0]}" 'unshare' "${PROGRAMS_TO_EXECUTE[0]}" "${PROGRAMS_ARGS[0]}" 'container' ${PROGRAM_TIMES_TO_EXECUTE[0]};

Test_Program "unshare -muinpUCT --fork --map-root-user setpriv --nnp --securebits +noroot,+noroot_locked,+no_setuid_fixup_locked,+keep_caps_locked ${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[0]} ${PROGRAMS_ARGS[0]}" 'unshare+setpriv' "${PROGRAMS_TO_EXECUTE[0]}" "${PROGRAMS_ARGS[0]}" 'container' ${PROGRAM_TIMES_TO_EXECUTE[0]};

Test_Program "setpriv --nnp unshare -muinpUCT --fork --map-current-user -R ${C_CPP_BENCHMARKS_PATH} /${PROGRAMS_TO_EXECUTE[0]} ${PROGRAMS_ARGS[0]}" 'setpriv+unshare' "${PROGRAMS_TO_EXECUTE[0]}" "${PROGRAMS_ARGS[0]}" 'container' ${PROGRAM_TIMES_TO_EXECUTE[0]};

Test_Program "podman run --rm -ti --volume ${C_CPP_BENCHMARKS_PATH}:/ --entrypoint /${PROGRAMS_TO_EXECUTE[0]} empty_container ${PROGRAMS_ARGS[0]}" 'podman' "${PROGRAMS_TO_EXECUTE[0]}" "${PROGRAMS_ARGS[0]}" 'container' ${PROGRAM_TIMES_TO_EXECUTE[0]};

Test_Program "bwrap --new-session --unshare-all --cap-drop all --ro-bind ${C_CPP_BENCHMARKS_PATH} / /${PROGRAMS_TO_EXECUTE[0]} ${PROGRAMS_ARGS[0]}" 'bwrap' "${PROGRAMS_TO_EXECUTE[0]}" "${PROGRAMS_ARGS[0]}" 'container' ${PROGRAM_TIMES_TO_EXECUTE[0]};

Test_Program "systemd-run --user --wait --collect -p 'NoNewPrivileges=true' -p 'MemoryDenyWriteExecute=true' -p 'PrivateUsers=true' -p 'SecureBits=keep-caps-locked no-setuid-fixup-locked noroot noroot-locked' -p 'CapabilityBoundingSet=' -p 'AmbientCapabilities=' ${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[0]} ${PROGRAMS_ARGS[0]}" 'systemd-run' "${PROGRAMS_TO_EXECUTE[0]}" "${PROGRAMS_ARGS[0]}" 'container' ${PROGRAM_TIMES_TO_EXECUTE[0]};

Test_Program "systemd-run --user --wait --collect -p 'SystemCallFilter=${SYSCALLS_SPACE_SEP}' -p 'NoNewPrivileges=true' -p 'MemoryDenyWriteExecute=true' -p 'PrivateUsers=true' -p 'SecureBits=keep-caps-locked no-setuid-fixup-locked noroot noroot-locked' -p 'CapabilityBoundingSet=' -p 'AmbientCapabilities=' ${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[0]} ${PROGRAMS_ARGS[0]}" 'systemd-run(seccomp)' "${PROGRAMS_TO_EXECUTE[0]}" "${PROGRAMS_ARGS[0]}" 'container' ${PROGRAM_TIMES_TO_EXECUTE[0]};


# Speed, native and syscalls tests
for VAR in ${!PROGRAMS_TO_EXECUTE[@]}
do
    # Native
    Test_Program "${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" 'native' ${PROGRAM_TIMES_TO_EXECUTE[VAR]};

    # My implementation
    #Test_Program "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp --host-filesystem --no-seccomp ${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}";

    Test_Program "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp --unshare all --apparmor-profile-exec restricted_native_web_app --fork --host-filesystem --no-seccomp ${C_CPP_BENCHMARKS_PATH}/${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" 'LLC' "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" 'custom_container' ${PROGRAM_TIMES_TO_EXECUTE[VAR]};

    Test_Program "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp --unshare all --apparmor-profile-exec restricted_native_web_app --fork --no-seccomp --pivot-root ${C_CPP_BENCHMARKS_PATH} /${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" 'LLC(pivot-root)' "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" 'custom_container' ${PROGRAM_TIMES_TO_EXECUTE[VAR]};

    Test_Program "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp --unshare all --apparmor-profile-exec restricted_native_web_app --fork --seccomp-syscalls ${SYSCALLS} --pivot-root ${C_CPP_BENCHMARKS_PATH} /${PROGRAMS_TO_EXECUTE[VAR]} ${PROGRAMS_ARGS[VAR]}" 'LLC(seccomp)' "${PROGRAMS_TO_EXECUTE[VAR]}" "${PROGRAMS_ARGS[VAR]}" 'custom_container' ${PROGRAM_TIMES_TO_EXECUTE[VAR]};
done

# WASM tests
printf 'WASM tests';

./perf_test_web_server.js google-chrome --incognito chrome >>'Perf_results.tsv';

./perf_test_web_server.js chromium --incognito chromium >>'Perf_results.tsv';

./perf_test_web_server.js '/home/caioh/Downloads/firefox/firefox' --private firefox >>'Perf_results.tsv';
