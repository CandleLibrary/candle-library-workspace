import { execSync } from "child_process";

export function gitStatus(CWD: string, pkg_path: string = "") {
    try {
        return execSync(`git status -s --column ${pkg_path}`,
            { cwd: CWD }
        ).toString();
    } catch (e) {
        if (e instanceof Error)
            console.error(e.toString());
        return "";
    }
}


export function gitLog(CWD: string, pkg_path: string = "", prev_commit: string): string {
    try {
        return execSync(
            `git log --no-decorate ${prev_commit ? `${prev_commit}..HEAD ` : ""}${pkg_path} || git log --no-decorate ${pkg_path}`,
            { cwd: CWD }
        ).toString();
    } catch (e) {
        if (e instanceof Error)
            console.error(e.toString());
        return "";
    }
}

export function gitAdd(CWD: string, paths: string = "."): boolean {
    try {
        execSync(
            `git add ${paths}`,
            { cwd: CWD }
        );
        return true;
    } catch (e) {
        if (e instanceof Error)
            console.log(e.toString());
        return false; e;
    }
}


export function gitCommit(CWD: string, commit_message: string = ""): boolean {
    if (!commit_message)
        return false;

    try {
        execSync(
            `git commit -m "${commit_message}"`,
            { cwd: CWD }
        );
        return true;
    } catch (e) {
        if (e instanceof Error)
            console.error(e.toString());
        return false;
    }
}

export function gitTag(CWD: string, tag_name: string = "", tag_message: string = ""): boolean {
    if (!tag_name)
        return false;

    try {
        execSync(
            `git tag ${tag_message ? `-m "${tag_message}" ` : ""}${tag_name}`,
            { cwd: CWD }
        );
        return true;
    } catch (e) {
        if (e instanceof Error)
            console.error(e.toString());
        return false;
    }
}

export function gitCheckout(CWD: string, branch = ""): boolean {
    if (!branch)
        return false;

    try {

        execSync(
            `git checkout "${branch}"`,
            { cwd: CWD }
        );
        return true;
    } catch (e) {
        if (e instanceof Error)
            console.error(e.toString());
        return false;
    }
}

export function gitClone(remote_repo_url: string, CWD: string): boolean {
    if (!remote_repo_url)
        return false;

    try {

        execSync(
            `git clone "${remote_repo_url}"`,
            { cwd: CWD || "" }
        );
        return true;
    } catch (e) {
        if (e instanceof Error)
            console.error(e.toString());
        return false;
    }
}

export function gitPull(remote_repo_url: string, CWD: string): boolean {
    if (!remote_repo_url)
        return false;

    try {

        execSync(
            `git pull "${remote_repo_url}"`,
            { cwd: CWD || "" }
        );
        return true;
    } catch (e) {
        if (e instanceof Error)
            console.error(e.toString());
        return false;
    }
}

export function gitFetch(remote_repo_url: string, CWD: string): boolean {
    if (!remote_repo_url)
        return false;

    try {

        execSync(
            `git pull "${remote_repo_url}"`,
            { cwd: CWD || "" }
        );
        return true;
    } catch (e) {
        if (e instanceof Error)
            console.error(e.toString());
        return false;
    }
}