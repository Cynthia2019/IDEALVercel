export default function sigFigs(n, sig) {
    let neg = false;
    if (n == 0) {
        return 0;
    }
    if (n < 0) {
        neg = true;
        n = -n;
    }
    return parseFloat(n.toPrecision(sig));
}