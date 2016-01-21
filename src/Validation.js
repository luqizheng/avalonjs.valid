/// <reference path="init.js" />
var _defmsg = { val: function () { return ""; } };

function Validator() {    
    this.error = _defmsg;
    this.validating = false;
    this.async = false; //async validator, if you use ajax in the this.func, please set it to true.
    this.func = false;//function (value,callback) {}
    this.isPass = true;
}

function ValidObj(name) {
    this.validating = false;//中间状态，验证ing，
    this.success = "";
    this.error = "";
    this.validators = [];
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
                r = false;
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
        var isPass = self.error == "";        
        var binding, info;        
        for (var i = 0; i < self.classBindings.length; i++) {
            binding = self.classBindings[i];
            var properName=binding.name.split('-').pop();         
            var showOrNot = properName == "success" ? isPass : !isPass;
            avalon(binding.element).toggleClass(binding.clz, showOrNot)
        }       
        //output 信息        
        for (var i = 0; i < self.displayBindings.length; i++) {
            binding = self.displayBindings[i];
            var properName=binding.name.split('-').pop();            
            var msg = properName!="display" ? self[properName] : (self.success || self.error)
            avalon.innerHTML(binding.element, msg);
        }
    }

    this.valid = function (newValue) {
        var self = this;
        self.validating = true;
        var queue = [];
        for(var key in self.validators)
        {
            queue.push(self.validators[key]);
        }
        self.error = "";
        queue.push(function () {
            self.invokeResult();
        })

        function a() {
            var validator = queue.shift();
            if (!avalon.isFunction(validator)) {
                validator.func(newValue, function (isPass) {
                    validator.isPass = isPass;
                    if (isPass) {
                        a(); //成功继续验证。
                    }
                    else {
                        self.error = validator.error.val(validator);
                        queue.pop()();
                    }
                })
            }
            else {                
                validator(); //最后全部成功那么就输出成功的信息。
            }
        }
        a();
    }
    this._name=name;
    this.toString=function(){
        return this._name;
    }

}



