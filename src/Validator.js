
function Validator() {
    this.error = function () { return '输入错误情纠正'; };
    this.async = false; //async validator, if you use ajax in the this.func, please set it to true.
    this.func = false;//function (value,callback) {}
    this.isPass = true;
    this.init = avalon.noop;
}
