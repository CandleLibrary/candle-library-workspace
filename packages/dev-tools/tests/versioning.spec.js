import {
    createDepend,
    getPackageData,
    getPackageDependencies,
    testPackage
} from "../build/utils/version-sys.js";


assert_group("Basic utility functions", sequence, () => {

    assert((await getPackageData("@candlelib/wick")).name == "@candlelib/wick");

    assert((await getPackageData("@candlelib/hydrocarbon")).name == "@candlelib/hydrocarbon");

    assert((await getPackageData("@candlelib/conflagrate")).name == "@candlelib/conflagrate");

    assert((await getPackageData("@candlelib/js")).name == "@candlelib/js");

    assert((await getPackageData("@candlelib/spark")).name == "@candlelib/spark");

});


assert_group("Run tests", 200000, sequence, () => {

    const package = await getPackageData("@candlelib/wind");
    const result = await testPackage(package);
    assert("Expect wind test process to exit cleanly", result == true);

});


assert_group("Trace Dependencies", 200000, sequence, () => {
    const package = await getPackageData("@candlelib/js");
    const dep = await createDepend(package);

    const result = await getPackageDependencies("", dep, (pkg) => {

        const data = [];

        if (pkg.dependencies)
            data.push(...Object.keys(pkg.dependencies).filter(name => name.includes("@candlelib")));

        if (pkg.devDependencies)
            data.push(...Object.keys(pkg.devDependencies).filter(name => name.includes("@candlelib")));

        return new Set(data);
    });

    assert("Retrieves recursive package dependency list for @candlelib/js", result.size == 9);
    assert("Recursive package dependency list include @candlelib/conflagrate", result.has("@candlelib/conflagrate") == true);
    assert("Recursive package dependency list include @candlelib/uri", result.has("@candlelib/uri") == true);
    assert("Recursive package dependency list include @candlelib/wind", result.has("@candlelib/wind") == true);
    assert("Recursive package dependency list include @candlelib/js", result.has("@candlelib/js") == true);
});
