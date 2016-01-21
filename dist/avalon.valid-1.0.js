/*!
avalon.valid Copyright(c) 2011 Leo.lu  MIT Licensed
https://github.com/luqizheng/avalon.valid.js 
*/


/// <reference path="init.js" />
/// <reference path="const.js" />
(function (avalon) {

    
    var const_type = "val";
var const_prop = "$" + const_type //附件到vmodles的名字，不能是$，因为是附加属性

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




    /// <reference path="validation.js" />

function getValidObj(binding) {
    var vmodel = binding.vmodels[0],
        ary = binding.expr.split(':'),
        expr = ary[0],

        result = null;

    if (!vmodel[const_prop]) {
        //console.log(const_prop + " is no exist, build it")
        vmodel[const_prop] = {}
    }


    result = vmodel[const_prop][expr]
    if (!result) {
        //console.log(const_prop + "." + expr + ".is no exist, build it");
        result = new ValidObj()
        vmodel[const_prop][expr] = result;
    }
    return result;
}

function getValidator(binding) {
    var validObj = getValidObj(binding);
    var validName = getFullNameValidationType(binding)
    var result = validObj.validators[validName];
    if (!result) {
        //console.log(const_prop + "." + binding.expr + ".validators.[" + validName + "] is no exist, build it");
        result = new Validator();
        validObj.validators[validName] = result;
    }
    return result;
}
function anaylz(binding) {
    var aryParam = binding.param.split('-');
    var param = (aryParam.length > 1) ? aryParam[1] : "";
    return {
        name: aryParam[0].toLowerCase(),
        param: param
    };
}

function getValidationType(binding) {
    var aryParam = binding.param.split('-')
    return aryParam[0].toLowerCase();
}

function getFullNameValidationType(binding) {
    var aryParam = binding.param.split('-')
    var validName = aryParam[0]
    var lastParam = aryParam.pop();//返回最有一个参数，看看是不是数值。
    var index = parseInt(lastParam);
    if (index)
        validName += index;
    return validName;
}


var msgRegex = /\[([^\[\]]|\[([^\[\]])*\])*\]/gi;


function setProperties(binding, validationObj) {

    var ele = binding.element;
    var type = binding.type,
        dataAttrName = "data-" + type + "-" + binding.param + "-"

    for (var i = 0; i < ele.attributes.length; i++) {
        var attr = ele.attributes[i];
        var reg = new RegExp(dataAttrName + ".*");
        var matches = attr.name.match(reg);
        if (matches != null) {
            var pathes = attr.name.substr(dataAttrName.length).split('-');
            if (pathes.length == 0)
                continue;
            var lastProp = pathes.pop();

            var curObj = validationObj;
            while (pathes.length != 0) {
                curObj = curObj[pathes.shift()];
            }
            curObj[lastProp] = {
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
            //ele.removeAttribute(attr);
        }
    }
}
    avalon.directive(const_type, {
        init: function (binding) {
            //console.log("init " + binding.expr);
            var info = anaylz(binding);      
            //这里只处理验证器就可以了            
            if (isValidator(info.name)) {
                initHandler.validator(binding, info);
            } else {
                var method = initHandler[info.name];

                if (method)
                    method(binding, info);
                else {
                    avalon.log("warning", info.name, "is not a validation")
                }
            }
        },
        update: function (newValue, oldValue) {
            var isFirst = oldValue === undefined;//第一次绑定，不需要验证。
            var binding = this;
            var info = anaylz(binding);
            if (isFirst) {              
                //displayBinding  cssBindg 只运行一次，因此。。。
                if (!isValidator(info.name)) {
                    var vobj = getValidObj(this);
                    /*if (info.name == "class")
                        vobj.clzBinding.push(this);
                    if (info.name == "display")
                        vobj.displays.push(this)*/
                    vobj[info.name + "Bindings"].push(this)
                }
                return;
            }


            console.log("call output " + info.name)
            if (isValidator(info.name)) {
                updateHandler.validator.call(this, newValue, info);
            }
        }
    })


    var initHandler = {
        validator: function (binding, info) {
            var vObjIns = getValidator(binding);
            var elem = binding.element;
            var vObjExtends = avalon[const_type][info.name]
            if (!vObjExtends) {
                avalon.log("warning", info.name + " validator can't be found in avalon[" + const_type + "]");
            }
            avalon.mix(vObjIns, vObjExtends());
            setProperties(binding, vObjIns, binding.expr)

            avalon(elem).bind('blur', bCheck)

            binding.roolback = function () {
                avalon(elem).unbind("click", bCheck)
            }
            function bCheck() {
                updateHandler.validator.call(binding, this.value, info);
            }
        },
        display: function (binding, info) {
            binding.oneTime = true;
            //binding.priority-=500;
        },
        "class": function (binding, info) {
            //binding.type = "class"//强制改为class;            
            var ary = binding.expr.split(':');
            if (ary.length < 2) {
                avalon.log("error", binding.expr + " 必须是 className:bindgName")
                throw new Exception(binding.expr + " 必须是 className:bindgName");
            }
            //binding.name="ms-class"
            //binding.param="";
            //binding.type="class";
            var newValue = ary[1]; //ary[1] + ":" + const_prop + "." + ary[0] + "." + info.param;
            //console.log(newValue);
            binding.expr = newValue;
            binding.clz = ary[0];
            binding.oneTime = true;
            //binding.priority-=500;
        }

    }

    var updateHandler = {
        validator: function (newValue, info) {
            var binding = this;
            var vobj = getValidObj(binding);
            var validator = vobj.validators[info.name];
            if (validator.async) {
                vobj.validating = true;
            }
            validator.func(newValue, function (isPass) {
                validator.isPass = isPass;
                vobj.validating = false;                
                //var message = isPass ? "success" : "error";
                //vobj[message] = validator[message].msg();
                //console.log(vobj.success + "," + vobj.error)
                vobj.invokeResult();
            })
        }
    }

    function isValidator(name) {
        return name != "display" && name != "class";
    } 

    avalon[const_type] = {
    required: function () {
        return {
            func: function (value, cb) {
                cb(value != null && value != "")
            }
        }
    },
    maxlength: function () {
        return {
            length: 10,
            func: function (value, cb) {
                var len = parseInt(this.length)
                cb(value.toString().length <= len);
            }
        }
    },
    minlength: function () {
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