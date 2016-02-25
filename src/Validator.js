
function Validator() {
    this.error = function (attr) { return '输入错误请纠正'; };
   
    this.func = false;//function (value,callback) {}
    
    this.inited = avalon.noop; //初始化接
}
