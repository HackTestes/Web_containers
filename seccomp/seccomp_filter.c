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

#define _GNU_SOURCE

#include <seccomp.h> // seccomp
#include <stdio.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <stddef.h>

#include <unistd.h> // exec
#include <sys/apparmor.h> // apparmor
#include <sched.h> // unshare
#include <stdlib.h>

#include <sys/capability.h> // capability

const cap_value_t cap_list[] = {
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
    CAP_WAKE_ALARM};

int main(int argc, char *argv[])
{
    int rc = -1;
    scmp_filter_ctx ctx = seccomp_init(SCMP_ACT_KILL_PROCESS);

    //seccomp_arch_add(ctx, SCMP_ARCH_X86);
    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(read), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(write), 0); 
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(exit), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(exit_group), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(execve), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(arch_prctl), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(brk), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(mprotect), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(fstat), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(readlink), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(close), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(access), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(openat), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(newfstatat), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(mmap), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(openat), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(set_tid_address), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(set_robust_list), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(prlimit64), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(munmap), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(statfs), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(access), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(getgid), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(geteuid), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(capget), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(prctl), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(ioctl), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(rt_sigprocmask), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(eventfd2), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(clone), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(clone), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(fcntl), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(getdents64), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(signalfd4), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(poll), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(uname), 0);
    if (rc < 0)
            goto out;

    rc = seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(wait4), 0);
    if (rc < 0)
            goto out;

    //seccomp_export_bpf(ctx, 1);
    //seccomp_export_pfc(ctx, 2);

    aa_change_onexec("/media/caioh/EXTERNAL_HDD1/TCC_CAIO/servidor_nodejs/server/apps/**");

    // man unshare(2)
    if(unshare(CLONE_NEWCGROUP|CLONE_NEWIPC|CLONE_NEWNS|CLONE_NEWNET|CLONE_NEWPID|CLONE_NEWUTS|CLONE_NEWUSER) == -1)
    {
        perror("Unshare");
        exit(EXIT_FAILURE);
    }

    if( cap_reset_ambient() == -1 )
    {
        perror("Cap ambient reset");
        exit(EXIT_FAILURE);
    }

    for(int i=0; i < ( sizeof(cap_list) / sizeof(cap_value_t) ); ++i)
    {
        if(cap_drop_bound(cap_list[i]) == -1)
        {
            perror("Cap drop bound");
            exit(EXIT_FAILURE);
        }
    }

    char** new_args = malloc( (argc) * sizeof(char*) );

    for(int i=0; i < (argc-1); ++i)
    {
        new_args[i] = argv[i + 1];
    }

    /*
    for(int i=0; i < argc; ++i)
    {
        printf("My new_arg[%d]: %s\n", i, new_args[i]);
    }

    printf("Argc: %d - Argv: %s\n", argc, argv[1]);
    */

    seccomp_load(ctx);
    if( execvp(argv[1], new_args) == -1 )
    {
        perror("Execvp error");
        exit(EXIT_FAILURE);
    }

out:
    seccomp_release(ctx);
    return 0;
}