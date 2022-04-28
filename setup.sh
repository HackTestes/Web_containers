echo 'Some steps require ROOT privilegies!!! Please verify all the commands'
echo "Run this script in the project's root directory"


CURRENT_WD=$(pwd)
SETUP_APPARMOR="cd ./AppArmor_profiles/ && sudo cp -i * /etc/apparmor.d/ && sudo systemctl relaod apparmor && cd ${CURRENT_WD}"
SETUP_BUILD_SANDBOX_PROGRAM="cd ./seccomp && gcc ./seccomp_filter.c -o ./exec_program_seccomp -lseccomp -lcap -lapparmor -static && ./exec_program_seccomp --help && de ${CURRENT_WD}"
SETUP_BUILD_CPP_TESTS="cd ./site_testes_pequenos_performance/C_CPP_Benchmarks && make && echo 'Tests compiled' && cd ${CURRENT_WD}"
SETUP_NODEJS_DEPENDECIES="cd ./servidor_nodejs && npm install && cd ${CURRENT_WD}"


printf "CURRENT WORKING DIRECTORY: ${CURRENT_WD} \n\n"

printf "${SETUP_APPARMOR} \n\n" && bash -c "${SETUP_APPARMOR}"

printf "${SETUP_BUILD_SANDBOX_PROGRAM} \n\n" && bash -c "${SETUP_BUILD_SANDBOX_PROGRAM}"

printf "${SETUP_BUILD_CPP_TESTS} \n\n" && bash -c "${SETUP_BUILD_CPP_TESTS}"

printf "${SETUP_NODEJS_DEPENDECIES} \n\n" && bash -c "${SETUP_NODEJS_DEPENDECIES}"
