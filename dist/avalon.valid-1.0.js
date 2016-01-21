/*!
avalon.valid Copyright(c) 2011 Leo.lu  MIT Licensed
https://github.com/luqizheng/avalon.valid.js 
*/


/// <reference path="init.js" />
/// <reference path="const.js" />
(function (avalon) {

    "use strict";

    var const_type = "val";
var const_prop = "$" + const_type //附件到vmodles的名字，不能是$，因为是附加属性

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




    /// <reference path="validation.js" />
var _ValidObjSet = {
    getValidObj: function (binding) {
        var vmodel = binding.vmodels[0],
            ary = binding.expr.split(':'),            
            propertyName = ary[ary.length>1?1:0],
            result = null;
        avalon.log("debug create validObj for ",propertyName)
        if (!vmodel[const_prop]) {            
            vmodel[const_prop] = {
                valida:function(){
                    
                }
            }
        }
        result = vmodel[const_prop][propertyName]
        if (!result) {            
            result = new ValidObj(propertyName);            
            vmodel[const_prop][propertyName] = result;
        }
        return result;
    }
 }


var msgRegex = /\[([^\[\]]|\[([^\[\]])*\])*\]/gi;

var validatorFactory = {
    create: function (element) {
        
        var result = {};
        for (var i = 0; i < element.attributes.length; i++) {
            var attr = element.attributes[i];
            if (!/^val-/gi.test(attr.name)) {
                continue;
            }
            var aryNames = attr.name.substr(4).split('-');
            var prop = aryNames.pop();
            if (aryNames.length == 0)
                continue;
            var validatorName = aryNames.shift();
            var validatorCreator = avalon[const_type][validatorName];
            if (!validatorCreator) {
                avalon.log("warn", "can't find", validatorName, " defined.")
                continue;
            }
            
            var validator = result[validatorName];
            if(!validator) {            
                validator=this._creatorValidator(validatorCreator, aryNames, prop, attr);
                result[validatorName]=validator;
            }
        }
        
        return result;
    },
    _creatorValidator: function (validatorCreator, pathes, propName, attr) {
        var result = new Validator();
        var setting = validatorCreator();
        var val=attr.val;
        avalon.mix(result, setting);
        
        var curObj = result;
        while (pathes.length != 0) {
            curObj = curObj[pathes.shift()];
            if (curObj === undefined) {
                avalon.log("warn", propName, "is not exist.")
                return result;
            }
        }
        if(propName=="error"){
            curObj[propName]=this._createAttributeReader(attr)
        }
        else{
            curObj[propName] = converTo(val,curObj[propName]);
        }
        avalon.log("debug",propName,"=",curObj[propName]);
        return result;
    },
    _createAttributeReader: function (attr) {
        return {
            attr: attr,
            val: function (validator) {
                var content = this.attr.value;
                if (validator) {
                    var matches = content.match(msgRegex);
                    avalon.each(matches, function (i, v) {
                        var propName = v.substring(1, v.length - 1);
                        content = content.replace(new RegExp("\\[" + propName + "\\]", "ig"), validator[propName].val());
                    })
                }
                return content;
            }
        }
    }   

}

 function converTo(strValue,targrValue){
        var type=typeof targrValue
         switch (type) {
            case "number":
                strValue = parseFloat(strValue);
            case "booleam":
                strValue = strValue.toCaseLower() == "true"
        }
        return strValue;
    }
    avalon.directive(const_type, {
        init: function (binding) {
            //console.log("init " + binding.expr);
            //ms-val="prop"
            //ms-val-display="prop"
            //ms-val-class="class:prop"
            var vObj = _ValidObjSet.getValidObj(binding);
            if (binding.name == "ms-val") {
                var validators = validatorFactory.create(binding.element);
                vObj.validators = validators;
                initHandler.validator(binding);
                return;
            }
            else if (binding.name.substr(0, "ms-val-class".length) == "ms-val-class") {
                initHandler.class(binding);
                vObj.classBindings.push(binding);
            }
            else if (binding.name.substr(0, "ms-val-display".length) == "ms-val-display") {
                binding.oneTime = true;
                vObj.displayBindings.push(binding);
            }           
        },
        update: function (newValue, oldValue) {
            var isFirst = oldValue === undefined;//第一次绑定，不需要验证。
            var binding = this;           
            var vobj = _ValidObjSet.getValidObj(this);
            if (isFirst) {
                vobj.value = newValue;
                return;
            }
            vobj.valid(newValue);            
        }
    })


    var initHandler = {
        validator: function (binding) {
            var elem=binding.element;
            avalon(elem).bind('blur', bCheck)
            binding.roolback = function () {
                avalon(elem).unbind("blur", bCheck)
            }
            function bCheck() {
                //updateHandler.validator.call(binding, this.value, info);
                _ValidObjSet.getValidObj(binding).valid(this.value);
            }
        },      
        "class": function (binding, info) {
            //binding.type = "class"//强制改为class;            
            var ary = binding.expr.split(':');
            if (ary.length < 2) {
                avalon.log("error", binding.expr + " 必须是 className:bindgName")
                throw new Exception(binding.expr + " 必须是 className:bindgName");
            }
            var newValue = ary[1]; //ary[1] + ":" + const_prop + "." + ary[0] + "." + info.param;            
            binding.expr = newValue;
            binding.clz = ary[0];
            binding.oneTime = true;
        }

    }

     

    avalon[const_type] = {
    required: function () {
        return {
            func: function (value, cb) {
                cb(value != null && value != "")
            }
        }
    },
    maxlen: function () {
        return {
            length: 10,
            func: function (value, cb) {
                var len = parseInt(this.length)
                cb(value.toString().length <= len);
            }
        }
    },
    minlen: function () {
        return {
            length: 6,
            func: function (value, cb) {
                var len = parseInt(this.length)
                cb(value.toString().length >= len);
            }
        }
    },
    range: function () {
        return {
            min: false,
            max: false,
            func: function (val, cb) {
                var max = parseFloat(this.max.val())
                var min = parseFloat(this.min.val());
                var p = parseFloat(val);
                var result = (p >= min && p <= max)
                avalon.log("range " + result);
                cb(result);
            }
        }
    }

}
    /* message */
    

})(avalon)