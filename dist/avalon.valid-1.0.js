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
var basic_tag={
    val:"ms-val",
    class:"ms-val-class",
    display:"ms-val-display"
}
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




    /// <reference path="validation.js" />
var _ValidObjSet = {
    getValidObj: function (binding) {
        var vmodel = binding.vmodels[binding.vmodels.length - 1],//top vm.
            ary = binding.expr.split(':'),
            propertyName = ary[ary.length > 1 ? 1 : 0],
            result = null,
            $id = binding.args[0].$id;
        if (!vmodel[const_prop]) {
            vmodel[const_prop] = {
                valid: function (callback) {
                    var validResult = [];
                    var summary = true;
                    for (var compId in this) {
                        if (compId == "valid")
                            continue;
                        for (var propertyName in this[compId])
                            validResult.push(compId + "." + propertyName);
                    }

                    for (var compId in this) {
                        if (compId == "valid")
                            continue;
                        for (var propertyName in this[compId]) {

                            this[compId][propertyName].valid(undefined, function (isPass) {
                                summary = summary && isPass;
                                avalon.log("valid all for " + this.$compId + "." + this.name)
                                avalon.Array.remove(validResult, this.$compId + "." + this.name);
                                if (validResult.length == 0) {
                                    callback(summary)
                                }
                            })
                        }
                    }

                }
            }
        }
        var comp = vmodel[const_prop][$id];
        if (!comp) {
            comp = {};
            vmodel[const_prop][$id] = comp;
        }


        result = comp[propertyName];
        if (!result) {
            result = new ValidObj(propertyName);
            result.binding = binding;
            result.comp = comp;
            result.$compId = $id;
            comp[propertyName] = result;
            avalon.log("debug", "created validation obj in ." + const_prop + "." + $id + "." + propertyName);
        }
        return result;
    }
}

var validatorFactory = {
    create: function (binding, vobj) {
        var result = {},
            element = binding.element;
        for (var i = 0; i < element.attributes.length; i++) {
            var attr = element.attributes[i];
            if (!/^val-/gi.test(attr.name)) {
                continue;
            }
            var aryNames = attr.name.substr(4).split('-');
            var validatorName = aryNames.shift();
            var validatorCreator = avalon[const_type][validatorName];
            if (!validatorCreator) {
                //如果不是验证器，那么就是vobj的属性
                //avalon.log("warn", "can't find", validatorName, " defined. so add it to vali")
                aryNames = [validatorName].concat(aryNames)
                setPropertyVal(vobj, aryNames, attr.value); //set验证对象
                continue;
            }

            var validator = result[validatorName];
            if (!validator) {
                validator = this._creatorValidator(validatorCreator, aryNames, attr);
                result[validatorName] = validator;
                validator.vObj = vobj;
            }
            validator.init(binding, vobj);
        }

        return result;
    },
    _creatorValidator: function (validatorCreator, pathes, attr) {
        var result = new Validator();
        result.attr = attr;
        var setting = validatorCreator();
        var propName = pathes.length > 0 ? pathes[pathes.length - 1] : false; //获取最有一个属性值，如果是error，那么就是可变的属性值，需要用message匹配
        avalon.mix(result, setting);

        if (propName) {
            setPropertyVal(result, pathes, attr.value)
        }
        return result;
    }
}

function setPropertyVal(obj, pathes, val, type) {
    var property = pathes.pop();
    var curObj = obj;
    while (pathes.length != 0) {
        curObj = curObj[pathes.shift()];
        if (curObj === undefined) {
            avalon.log("warn", propName, "is not exist.")
            return false;
        }
    }
    if (!type) { //如果没有设置 type值，那么类型就是他自己本身的类型
        type = typeof curObj[property];
    }
    curObj[property] = converTo(val, type);
    avalon.log("debug", property, "=", curObj[property]);
}

function converTo(strValue, type) {
    switch (type) {
        case "number":
            strValue = parseFloat(strValue);
            break;
        case "booleam":
            strValue = strValue.toCaseLower() == "true"
            break;
        case "function":
            strValue = function () {
                return this.attr.value;
            };
            break;
    }
    return strValue;
}
    avalon.directive(const_type, {
        init: function (binding) {
            if (binding.name.substr(0, basic_tag.class.length) == basic_tag.class) {
                initHandler.class(binding);
            } else if (binding.name.substr(0, "ms-val-display".length) == "ms-val-display") {
                binding.oneTime = true;
            } else if (binding.name == basic_tag.val) {
                var elem = binding.element;
                avalon(elem).bind('blur', bCheck)
                binding.roolback = function () {
                    avalon(elem).unbind("blur", bCheck)
                }
                function bCheck() {
                    //updateHandler.validator.call(binding, this.value, info);
                    var val = binding.getter ? binding.getter.apply(0, binding.args) : binding.oldValue;
                    _ValidObjSet.getValidObj(binding).valid(val);
                }
            }
        },
        update: function (newValue, oldValue) {
            var isFirst = oldValue === undefined;//第一次绑定，不需要验证。
            var binding = this;
            var vObj = _ValidObjSet.getValidObj(binding);
            if (isFirst) {
                console.log("init " + binding.uniqueNumber);
                //ms-val="prop"
                //ms-val-display="prop"
                //ms-val-class="class:prop"
                
                if (binding.name == basic_tag.val) {
                    if (binding.name == basic_tag.val) {
                        var validators = validatorFactory.create(binding, vObj);
                        vObj.validators = validators;
                        initHandler.validator(binding);
                    }
                    return;
                }
                else if (binding.name.substr(0, basic_tag.class.length) == basic_tag.class) {
                    vObj.classBindings.push(binding);
                }
                else if (binding.name.substr(0, "ms-val-display".length) == "ms-val-display") {
                    binding.oneTime = true;
                    vObj.displayBindings.push(binding);
                } else {
                    avalon.log("warn", binding.name + " do not support.")
                }
                vObj.value = newValue;
                return;
            }
            vObj.valid(newValue);
            vObj.notify();
        }
    })


    var initHandler = {
        validator: function (binding) {
            return;
            var elem = binding.element;
            avalon(elem).bind('blur', bCheck)
            binding.roolback = function () {
                avalon(elem).unbind("blur", bCheck)
            }
            function bCheck() {
                //updateHandler.validator.call(binding, this.value, info);
                var val = binding.getter.apply(0, binding.args);
                _ValidObjSet.getValidObj(binding).valid(val);
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
            },
            error: function (vObj) {
                return "请输入" + vObj.name + "的值"
            }
        }
    },
    maxlen: function () {
        return {
            length: 10,
            func: function (value, cb) {
                var len = parseInt(this.length)
                cb(value.toString().length <= len);
            },
            error: function (vObj) {
                return "最多只能输入" + this.length + "个字符";
            }

        }
    },
    minlen: function () {
        return {
            length: 6,
            func: function (value, cb) {
                var len = parseInt(this.length)
                cb(value.toString().length >= len);
            },
            error: function (vObj) {
                return "请至少输入[length]个字符";
            }
        }
    },
    range: function () {
        return {
            min: 1,
            max: 200,
            func: function (val, cb) {
                var max = parseFloat(this.max.val())
                var min = parseFloat(this.min.val());
                var p = parseFloat(val);
                var result = (p >= min && p <= max)
                cb(result);
            },
            error: function (vObj) {
                return "请输入的数值范围在[min]和[max]之间";
            }
        }
    },
    equal: function () {
        return {
            compare: "",
            func: function (val, cb) {
                var binding = this.vObj.comp[this.compare].binding;
                var data = binding.getter.apply(0, binding.args);
                cb(data == val);
            },
            error: function (vObj) {
                return "不一致"
            },
            init:function(binding, vobj){
                var compareValidObj = this.vObj.comp[this.compare]
                compareValidObj.notifyValidators.push(this);
            }
        }
    }

}
    /* message */
    

})(avalon)