
function Validator() {
    this.error = function (attr) { return '输入错误请纠正'; };
    this.async = false; //async validator, if you use ajax in the this.func, please set it to true.
    this.func = false;//function (value,callback) {}
    this.init = avalon.noop; //刚刚创建Validator的时候
    this.inited = avalon.noop; //初始化接
}
