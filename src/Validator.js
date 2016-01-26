
function Validator() {
    this.error = function (attr) { return '输入错误情纠正'; };
    this.async = false; //async validator, if you use ajax in the this.func, please set it to true.
    this.func = false;//function (value,callback) {}
    this.init = avalon.noop;
    this.inited = avalon.noop;
    this.attrs = {};//属性访问其，默认情况是 {properyName,attr对象}
}
