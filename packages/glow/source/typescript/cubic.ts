const
    pow = Math.pow,
    sqrt = Math.sqrt,
    acos = Math.acos,
    cos = Math.cos,
    PI = Math.PI;

function cuberoot(v: number) {
    if (v < 0)
        return -pow(-v, 1 / 3);
    return pow(v, 1 / 3);
}
function point(t: number, p2: number, p3: number) {
    var ti = 1 - t;
    var ti2 = ti * ti;
    var t2 = t * t;
    return /* ti * ti2 * p1(=0) + */ 3 * ti2 * t * p2 + t2 * 3 * ti * p3 + t2 * t /* * p4(=1) */;
}
export function getYatXCubic(x: number, p1X: number, p1Y: number, p2X: number, p2Y: number) {
    //Clamp p1X and p2X
    p1X = Math.max(0, Math.min(p1X, 1));
    p2X = Math.max(0, Math.min(p2X, 1));

    var x1 = -x,
        x2 = p1X - x,
        x3 = p2X - x,
        x4 = 1 - x,
        x2_3 = x2 * 3,
        x1_3 = x1 * 3,
        x3_3 = x3 * 3,
        d = (-x1 + x2_3 - x3_3 + x4),
        di = 1 / d,
        i3 = 1 / 3,
        a = (x1_3 - 6 * x2 + x3_3) * di,
        b = (-x1_3 + x2_3) * di,
        c = x1 * di,
        p = (3 * b - a * a) * i3,
        p3 = p * i3,
        q = (2 * a * a * a - 9 * a * b + 27 * c) * (1 / 27), q2 = q * 0.5,
        discriminant = q2 * q2 + p3 * p3 * p3;

    // and some variables we're going to use later on:
    var u1, v1, root;

    //Three real roots can never happen if p1(0,0) and p4(1,1);
    // three real roots, but two of them are equal:
    if (discriminant < 0) {

        var mp3 = -p / 3, mp33 = mp3 * mp3 * mp3,
            r = sqrt(mp33),
            t = -q / (2 * r),
            cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
            phi = acos(cosphi), crtr = cuberoot(r),
            t1 = 2 * crtr;

        root = t1 * cos((phi + 4 * PI) / 3) - a / 3;

    } else if (discriminant === 0) {
        u1 = q2 < 0 ? cuberoot(-q2) : -cuberoot(q2);
        root = -u1 - a * i3;
    } else {
        var sd = sqrt(discriminant);
        // one real root, two complex roots
        u1 = cuberoot(sd - q2);
        v1 = cuberoot(sd + q2);
        root = u1 - v1 - a * i3;
    }

    return point(root, p1Y, p2Y);
}
