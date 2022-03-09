// Sources
// man seccomp_init
// man seccomp_export_bpf
// man seccomp_rule_add
// man syscalls(2)
// https://blog.mnus.de/2020/05/sandboxing-soldatserver-with-bubblewrap-and-seccomp/

// Dependencies
// libseccomp - https://github.com/seccomp/libseccomp

#include <seccomp.h>
#include <stdio.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <stddef.h>


int main(int argc, char *argv[])
{
    int rc;
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

    seccomp_export_bpf(ctx, 1);
    //seccomp_export_pfc(ctx, 2);

out:
    seccomp_release(ctx);
    return 0;
}