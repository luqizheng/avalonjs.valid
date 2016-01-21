/// <reference path="init.js" />
var _defmsg = { val: function () { return ""; } };

function Validator() {
    this.success = _defmsg;
    this.error = _defmsg;
    this.validating = false;
    this.async = false; //async validator, if you use ajax in the this.func, please set it to true.
    this.func = false;//function (value,callback) {}
    this.isPass = true;
}

function ValidObj() {
    this.validating = false;//中间状态，验证ing，
    //this.success = "";
    //this.error = "";
    this.validators = {};//保存一堆验证器，因此不需要监控 对象为 
    this.clear = function () {
        this.success = "";
        this.error = "";
    }
    this.isPass = function () {
        var r = true;
        var success = "";
        var error = "";
        avalon.each(this.validators, function (a, validator) {
            //如果有一个验证器发现错误，那么success 一定为空。并且error是第一个验证器的验证结果。
            if (validator.isPass && !error) {
                success = validator.success.val(validator);
            }
            else if (!error) {
                error = validator.error.val(validator);
                success = "";
                r=false;
                return false;
            }                         
        })
        return {
            success: success,
            error: error,
            isPass: r
        };
    },
    this.classBindings = [];//bidng of class.
    this.displayBindings = [];//bind of display
    this.validatings = [];
    this.invokeResult = function () {
        //已经知道结果了。
        var self = this;
        var vResult = self.isPass();
        var isPass = vResult.isPass
        console.log("isPass" + isPass)
        var binding, info;
        console.debug("classBindings:" + self.classBindings.length)
        for (var i = 0; i < self.classBindings.length; i++) {
            binding = self.classBindings[i];
            info = anaylz(binding);
            var showOrNot = info.param == "success" ? isPass : !isPass;
            avalon(binding.element).toggleClass(binding.clz, showOrNot)
        }       
        //output 信息        
        for (var i = 0; i < self.displayBindings.length; i++) {
            binding = self.displayBindings[i];
            info = anaylz(binding);
            var msg = info.param ? self[info.param] : (vResult.success || vResult.error)
            avalon.innerHTML(binding.element, msg);
        }
    }

}



