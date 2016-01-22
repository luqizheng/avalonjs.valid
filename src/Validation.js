/// <reference path="init.js" />
/// <reference path="../lib/avalon.js" />
function Validator() {
    this.error = function () { return "输入错误情纠正"; };
    this.async = false; //async validator, if you use ajax in the this.func, please set it to true.
    this.func = false;//function (value,callback) {}
    this.isPass = true;
    this.init = avalon.noop;
}

function ValidObj(name) {
    this.validating = false;//中间状态，验证ing，    
    this.success = "正确";
    this.$id="";
    this.error = "";
    this.validators = [];
    this.value = "";
    this.classBindings = [];//bidng of class.
    this.displayBindings = [];//bind of display   
    this.binding=null; //binding of avalon.
    this.output = function () {
        //已经知道结果了。
        var self = this;
        var isPass = self.error == "";
        avalon.each(self.classBindings, function (i, binding) {
            var properName = binding.name.split('-').pop();
            var showOrNot = properName == "success" ? isPass : !isPass;
            avalon(binding.element).toggleClass(binding.clz, showOrNot)
        });       
        //output 信息        
        avalon.each(self.displayBindings, function (i, binding) {
            var properName = binding.name.split('-').pop();
            var msg = isPass ? self.success : self.error
            if (properName == "success")
                msg = isPass ? self.success : "";
            if (properName == "error")
                msg = !isPass ? self.error : "";
            avalon.innerHTML(binding.element, msg);
        });
    }    
  
    this.valid = function (newValue, callback) {

        var self = this;
        self.validating = true;
        self.error = "";
        if (self.value != "" && self.value == newValue) {
            return false;
        }
        if (newValue === undefined) {
            newValue = self.value;
        }
        //创建验证列表
        var queue = [];
        for (var key in self.validators) {
            queue.push(self.validators[key]);
        }

        queue.push(function () {
            self.value = newValue;
            self.validating = false;
            self.output();
            if(callback){
            callback.call(self, self.isPass());}
        })

        function _validQueue() {
            self.validating = true;
            var validator = queue.shift();
            if (!avalon.isFunction(validator)) {
                validator.func(newValue, function (isPass) {
                    validator.isPass = isPass;
                    if (isPass) {
                        _validQueue(); //成功继续验证。
                    }
                    else {
                        var msg = validator.error(self);
                        self.error = formatMessage(msg);
                        queue.pop()();
                    }
                })
            }
            else {
                validator(); //最后全部成功那么就输出成功的信息。
            }
        }
        _validQueue();
        return true;
    }

    this.name = name;
    this.toString = function () {
        return this.name;
    }
    this.isPass = function () { return this.error == ""; }
    this.notifyValidators=[]; //如果值发生变动，那么需要通知的其他binding
    
    this.notify=function(){
        avalon.each(this.notifyValidators,function(i,v){
           v.vObj.valid(undefined); 
        });
    }

    var formatMessage = function (content) {
        var msgRegex = /\[([^\[\]]|\[([^\[\]])*\])*\]/gi;
        var matches = content.match(msgRegex);
        avalon.each(matches, function (i, v) {
            var propName = v.substring(1, v.length - 1);
            content = content.replace(new RegExp("\\[" + propName + "\\]", "ig"), validator[propName].val());
        })
        return content;
    }

}



