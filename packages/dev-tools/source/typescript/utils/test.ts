import { exec } from "child_process";
import { DevPkg } from "../types/types";
import { dev_logger } from './version-sys';

/**
 * Runs the testing system in a new process for the givin project
 */

export function testPackage(pkg: DevPkg): Promise<boolean> {
    return new Promise((res) => {

        const CWD = pkg._workspace_location;

        const test = pkg.scripts.test;
        const p = exec(test, { cwd: CWD, env: process.env }, (err, out, stderr) => {
            if (err) {
                dev_logger.get(`testing [${pkg.name}]`).error("Package failed testing");
                dev_logger.get(`testing [${pkg.name}]`).error(out + "\n" + stderr);
                res(false);
            }
            else
                res(true);
        });

        p.on("error", (err) => {
            dev_logger.get(`testing [${pkg.name}]`).error(err);
        });

        p.on("message", (msg) => {
            dev_logger.get(`testing [${pkg.name}]`).log(msg);
        });
    });
}
