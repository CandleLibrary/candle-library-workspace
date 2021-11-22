/**[API]:testing
 *
 * Retrieve package.json file and convert to json object, returning
 * and object `{package: PACKAGE_JSON_OBJECT, package_dir: string, FOUND:boolean}`,
 * or return same object with FOUND set to `false`, package set to `null`, and
 * package_dir set to `""`.
 */

import { getPackageJsonObject } from "../build/library/paraffin.js";
import URL from "@candlelib/uri";
import assert from "assert";

const
    test_dir_package = await getPackageJsonObject(URL.getCWDURL()),
    no_existent_package_dir = await getPackageJsonObject("/"),
    fake_package_dir = await getPackageJsonObject(URL.resolveRelative("./tests/data/", URL.getCWDURL()));

assert(test_dir_package.FOUND == true);
assert(test_dir_package.package?.name == "@candlelib/paraffin");
assert(test_dir_package.package_dir == URL.resolveRelative("./", URL.getCWDURL()).dir);

assert(no_existent_package_dir.FOUND == false);
assert(no_existent_package_dir.package === null);
assert(no_existent_package_dir.package_dir == "");

assert(fake_package_dir.FOUND == true);
assert(fake_package_dir?.package.name == "@wax/test");
assert(fake_package_dir.package.type == "commonjs");
assert(fake_package_dir.package.private == "true");
assert(fake_package_dir.package_dir == URL.resolveRelative("./tests/data/", URL.getCWDURL()).dir);
