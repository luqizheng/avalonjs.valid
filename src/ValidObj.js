/// <reference path='init.js' />
/// <reference path='Validator.js' />
/// <reference path='../lib/avalon.js' /> 
function ValidObj(name) {
    'use strict'; 
    this.validating = false;//中间状态，验证ing，    
    this.success = '';
    this.$compId='';
    this.error = '';
    this.validators = [];    
    this.classBindings = [];//bidng of class.
    this.displayBindings = [];//bind of display   
    this.binding=null; //binding of avalon.
    this.output = function () {
        //已经知道结果了。
        var self = this;
        var isPass = this.isPass();
        avalon.each(self.classBindings, function (i, binding) {
            var properName = binding.name.split('-').pop();
            var showOrNot = properName === 'success' ? isPass : !isPass;
            avalon(binding.element).toggleClass(binding.clz, showOrNot);
        });       
        //output 信息        
        avalon.each(self.displayBindings, function (i, binding) {
            var properName = binding.name.split('-').pop();
            var msg = isPass ? self.success : self.error;
            if (properName === 'success'){
                msg = isPass ? self.success : '';}
            if (properName === 'error'){
                msg = !isPass ? self.error : '';}
            avalon.innerHTML(binding.element, msg);
        });
    };
    this.getValue=function(){
        var binding=this.binding;
        return binding.getter ? binding.getter.apply(0, binding.args) : binding.oldValue;
    };
    this.isSameValue=function(newValue){
        var binding=this.binding;
        if(!binding.getter){
            return true;
        }
        if(newValue===undefined){
            newValue=binding.getter.apply(0, binding.args) ;
        }
        return newValue && newValue === binding.oldValue; //如果新值为空，那么就需要验证其验证。否则跳过。         
    };
    this.valid = function (newValue,callback) {
        var self = this;
        if (this.isSameValue(newValue)) {
            //newValue没有输入，那么检查binding是否带有getter，如果有证明值已经更改过但是还没有获取到
            //那么不需要检查.直接将上一次的结果返回就可以了。
            if(!callback){
                callback.call(self, self.isPass());
                return;      
            }       
        }
        if(newValue===undefined){
            newValue = this.getValue();
        }        
        self.validating = true;
        self.error = '';       
     
        //创建验证列表
        var queue = [];
        for (var key in self.validators) {
            queue.push(self.validators[key]);
        }

        queue.push(function () {            
            self.validating = false;
            self.output();
            if(callback){
                callback.call(self, self.isPass());
            }
        });

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
                        self.error = formatMessage(msg,validator,self);
                        queue.pop()();
                    }
                });
            }
            else {
                validator(); //最后全部成功那么就输出成功的信息。
            }
        }
        _validQueue();
        return true;
    };

    
    this._name = name;
    this.name = name;
    this.toString = function () {
        return this._name;
    }
    this.isPass = function () { return this.error === ''; };
    this.notifyValidators=[]; //如果值发生变动，那么需要通知的其他binding
    
    this.notify=function(){
        avalon.each(this.notifyValidators,function(i,v){
           v.vObj.valid(); 
        });
    };

    var formatMessage = function (content,validator,vObj) {
        var msgRegex = /\[([^\[\]]|\[([^\[\]])*\])*\]/gi;
        var matches = content.match(msgRegex);
        avalon.each(matches, function (i, v) {
            var propName = v.substring(1, v.length - 1); //去除中括号
            var useObj=validator,vobj="vObj";
            if(propName.subStr(0,vobj.length)===vobj){//如果是vObj开头用vObj的变量
                propName = propName.split(".")[1];
                useObj=vObj;
            }
            content = content.replace(new RegExp('\\[' + propName + '\\]', 'ig'), useObj[propName]);
        });
        return content;
    };

}



