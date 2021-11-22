export default class CSS_Number extends Number {

    static parse(l) {

        let sign = 1;


        if (l.ch == "-" && l.pk.ty == l.types.num) {
            l.sync();
            sign = -1;
        }

        if (l.ty == l.types.num) {
            let tx = l.tx;
            l.next();
            return new CSS_Number(sign * parseFloat(tx));
        }
        return null;
    }
}
