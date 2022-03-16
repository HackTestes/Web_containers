// Sources
// man seccomp_init
// man seccomp_export_bpf
// man seccomp_rule_add
// man syscalls(2)
// https://blog.mnus.de/2020/05/sandboxing-soldatserver-with-bubblewrap-and-seccomp/

// Dependencies
// libseccomp (-lseccomp) libseccomp-dev 
// libapparmor (-lapparmor) libapparmor-dev
// libcap (-lcap) libcap-dev

// Test shell command
/*

gcc ./seccomp_filter.c -o ./exec_program_seccomp -lseccomp -lcap -lapparmor -O2 && \
time ./exec_program_seccomp \
    --seccomp-syscalls execve,brk,arch_prctl,access,openat,newfstatat,mmap,close,read,pread64,mprotect,set_tid_address,set_robust_list,prlimit64,munmap,getrandom,write,exit_group,exit,fstat,readlink,uname,access \
    --apparmor-profile '/media/caioh/EXTERNAL_HDD1/TCC_CAIO/servidor_nodejs/server/apps/**' \
/bin/echo "hello"

*/


/*LICENSE*/

// Must add gpl!!!!

#define _GNU_SOURCE

#include <seccomp.h> // seccomp
#include <stdio.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <stddef.h>
#include <string.h>

#include <unistd.h> // exec
#include <sys/apparmor.h> // apparmor
#include <sched.h> // unshare
#include <stdlib.h>

#include <sys/capability.h> // capability

const cap_value_t cap_list[] =
{
    CAP_AUDIT_CONTROL,
    CAP_AUDIT_READ,
    CAP_AUDIT_WRITE,
    CAP_BLOCK_SUSPEND,
    CAP_BPF,
    CAP_CHECKPOINT_RESTORE,
    CAP_CHOWN,
    CAP_DAC_OVERRIDE,
    CAP_DAC_READ_SEARCH,
    CAP_FOWNER,
    CAP_FSETID,
    CAP_IPC_LOCK,
    CAP_IPC_OWNER,
    CAP_KILL,
    CAP_LEASE,
    CAP_LINUX_IMMUTABLE,
    CAP_MAC_ADMIN,
    CAP_MAC_OVERRIDE,
    CAP_MKNOD,
    CAP_NET_ADMIN,
    CAP_NET_BIND_SERVICE,
    CAP_NET_BROADCAST,
    CAP_NET_RAW,
    CAP_PERFMON,
    CAP_SETGID,
    CAP_SETFCAP,
    CAP_SETPCAP,
    CAP_SETUID,
    CAP_SYS_ADMIN,
    CAP_SYS_BOOT,
    CAP_SYS_CHROOT,
    CAP_SYS_MODULE,
    CAP_SYS_NICE,
    CAP_SYS_PACCT,
    CAP_SYS_PTRACE,
    CAP_SYS_RAWIO,
    CAP_SYS_RESOURCE,
    CAP_SYS_TIME,
    CAP_SYS_TTY_CONFIG,
    CAP_SYSLOG,
    CAP_WAKE_ALARM
};

int main(int argc, char *argv[])
{
    // configuration variables
    bool seccomp_enabled = true;
    bool apparmor_enabled = true;
    char* apparmor_profile;
    int new_program_index;

    int list_size = 100;
    int syscall_count = 0;
    char** seccomp_syscalls_list = malloc(list_size * sizeof(char*));

// -----------------------------------------------------------------------

    // Argument parsing
    for(int i=0; i < argc; ++i)
    {
        // Is it an argument?
        if('-' == argv[i][0])
        {
            // Options
            if(strcmp("--help", argv[i]) == 0)
            {
                char help_text[] =
                "\n"
                "sandbox_exec [OPTIONS] PROGRAM_PATH [PROGRAM_ARGS] \n\n"
                "[OPTIONS]\n"
                "--help : displays help \n"
                "--no-seccomp : disable seccomp filters \n"
                "--seccomp-syscalls <SYSCALLS,...> : list of allowed syscalls separated by ',' \n"
                "--no-apparmor : disable custom AppArmor profile (doesn't affect default system's policy)\n"
                "--apparmor-profile PROFILE : select a custom AppArmor profile \n";

                printf("%s", help_text);

                return 0;
            }

            else if(strcmp("--no-seccomp", argv[i]) == 0)
            {
                seccomp_enabled = false;
                continue;
            }

            else if(strcmp("--no-apparmor", argv[i]) == 0)
            {
                apparmor_enabled = false;
                continue;
            }

            else if(strcmp("--apparmor-profile", argv[i]) == 0)
            {
                apparmor_profile = argv[i+1];
                ++i;
                continue;
            }

            else if(strcmp("--seccomp-syscalls", argv[i]) == 0)
            {
                char* seccomp_syscalls = argv[i+1];
                char* string;

                ++i;

                for(int i=0; (string=strsep(&seccomp_syscalls, ",")) != NULL; ++i)
                {
                    ++syscall_count;

                    // Bigger than list size
                    if(syscall_count > list_size)
                    {
                        list_size += 50; // Realloc more memory
                        seccomp_syscalls_list = realloc(seccomp_syscalls_list, list_size * sizeof(char*));
                    }

                    seccomp_syscalls_list[i] = string;
                }

                continue;
            }

            else
            {
                fprintf(stderr, "%s", "Invalid option\n");
                exit(-1);
            }
        }

        // This is not an option and it is not the first argument[0]
        // Must be the program to execute (can't insert any other options)
        else if(i != 0)
        {
            new_program_index = i;
            break;
        }
    }

// -----------------------------------------------------------------------

    int rc = -1; // error code

    // start the filter(context - ctx) and select a default behavior or action
    scmp_filter_ctx ctx = seccomp_init(SCMP_ACT_KILL_PROCESS); // kill the entire process if any violation occurs

    // Select the correct architecture
    //seccomp_arch_add(ctx, SCMP_ARCH_X86);

    //printf("List size: %d \n", list_size);
    for(int i=0; i < syscall_count; ++i)
    {
        //printf("Syscall: %s \n", seccomp_syscalls_list[i]);
        int error_code = -1;

        // Add a rule to a context - (context, action, syscall, number of arguments to verify) - seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(read), 0);
        // Dynamically resolve syscalls names from a string
        error_code = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, seccomp_syscall_resolve_name(seccomp_syscalls_list[i]), 0);

        if(error_code < 0)
        {
            fprintf(stderr, "%s", "Invalid syscall\n");

            // Release the seccomp context
            seccomp_release(ctx);
            exit(EXIT_FAILURE);
        }
    }

    free(seccomp_syscalls_list);

// -----------------------------------------------------------------------

    // Select an AppArmor profile to use when execve gets called
    if(apparmor_enabled)
    {
        aa_change_onexec(apparmor_profile);
    }

// -----------------------------------------------------------------------

    // man unshare(2)
    // Creates new namespaces with unshare syscall
    // IMPORTANT: CLONE_NEWUSER grants ALL CAPABILITIES on the new namespace
    if(unshare(CLONE_NEWCGROUP|CLONE_NEWIPC|CLONE_NEWNS|CLONE_NEWNET|CLONE_NEWPID|CLONE_NEWUTS|CLONE_NEWUSER) == -1)
    {
        perror("Unshare");
        exit(EXIT_FAILURE);
    }

// -----------------------------------------------------------------------

    // Drop all ambient capabilities
    if( cap_reset_ambient() == -1 )
    {
        perror("Cap ambient reset");
        exit(EXIT_FAILURE);
    }

    // Drop all bound capabilities
    for(int i=0; i < ( sizeof(cap_list) / sizeof(cap_value_t) ); ++i)
    {
        if(cap_drop_bound(cap_list[i]) == -1)
        {
            perror("Cap drop bound");
            exit(EXIT_FAILURE);
        }
    }

// -----------------------------------------------------------------------

    // Creates an array with arguments for the next program to be executed
    char** new_args = malloc( (argc - new_program_index) * sizeof(char*) );

    for(int i=0; i < (argc - new_program_index); ++i)
    {
        new_args[i] = argv[i + new_program_index];
    }

    // TESTS
    /*
    for(int i=0; i < (argc - new_program_index); ++i)
    {
        printf(" new_arg[%d]: %s\n", i, new_args[i]);
    }
    */

    // Load profile into the kernel (CANNOT BE REMOVED AFTER THIS POINT)
    if (seccomp_enabled) {seccomp_load(ctx);}

    // Execute a new process with the arguments passed
    if( execvp(argv[new_program_index], new_args) == -1 )
    {
        perror("Execvp error");
        exit(EXIT_FAILURE);
    }

    free(new_args);
    seccomp_release(ctx);

    return 0;
}