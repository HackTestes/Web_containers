# Native sandbox
Secure environment for native code execution on Linux containers through the browser.

## Project description

This is a small utility program to sandbox native applications on Linux without requiring root or SUID. It is a single executable capable of using Linux's kernel features to restrict privilegies, besides, you can view it as a simple wrapper around some syscalls.

## How to build

The sandbox program is at this [folder](https://github.com/HackTestes/Web_containers/tree/master/seccomp). To compile it, simply use this command:

```
gcc ./seccomp_filter.c -o ./sandbox -Werror -lseccomp -lcap -lapparmor
```

### Dependencies

* gcc 11.2.0
* libseccomp
* libapparmor
* libcap

## Supported systems and settings

This sandbox utility only has full functionality on Linux systems with certain configurations

* Linux
* unprivileged seccomp
* unprivileged user namespace* (it can work without namespacing)

## How to use

NOTE: The sandbox does not need any other file to work and only accepts long options

### Help

```
sandbox --help
```

### Command structure

```
sandbox [OPTIONS] PROGRAM [PROGRAM ARGS]
```

### Example

```
sandbox --unshare all --fork --no-seccomp --host-filesystem bash
```

## Guidelines

1. The code must be small, simple and readable (easier to update and audit)

1. Use a minimal amount of dependencies

1. All security features must use the most restrictive option and be opt-out (if possible)

## How to contribute

Feel free to submit code, as long as it follows the guidelines.

## Security technologies

Here is a list of securty technologies implemented into the sandbox

- [x] SECCOMP

- [x] Capabilities

- [x] DAC (Discrecionary Access Control) - chmod

- [x] Secure bits

- [x] Namespacing and pivot root

- [x] no_new_privs bit

- [x] mount options

* MAC (Mandatory Access Control)

    - [x] AppArmor

    - [ ] SELinux

    - [ ] SMACK

    - [ ] Landlock

- [ ] Cgroups* (I consider CGROUPS a "security" technology, because it can stop resourece exhaustion attacks)


## FAQ

### Why use C?

I used the C programming language, mainly because many of the libraries are made for C and the Linux's syscalls use C interfaces. So using C, I wouldn't have to worry about compatibility issues.

### Can it be done in Rust?

I belive so, but this requires rewriting the entire sandbox and it also needs a way to interface with the C libraries or finding an equivalent in Rust.

### How can I report security issues?

Since the project is not very big, I don't have a dedicated channel for security related issues. For now, you can use the GitHub issues.

### What about the web stuff?

Separate project