!function (factory) { //http://chen.junchang.blog.163.com/blog/static/6344519201312514327466/

    //factory是一个函数，下面的koExports就是他的参数

    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // [1] CommonJS/Node.js
        // [1] 支持在module.exports.abc,或者直接exports.abc
        //var target = module['exports'] || exports; // module.exports is for Node.js
        //var avalon = require("avalon");
        //factory(avalon);
        define(function(){
            factory(require("avalon"));
        })
    } else if (typeof define === 'function' && define['amd']) {
        // [2] AMD anonymous module
        // [2] AMD 规范 
        //define(['exports'],function(exports){
        //    exports.abc = function(){}
        //});
        define(['avalon'], factory);
    } else {
        // [3] No module loader (plain <script> tag) - put directly in global namespace
        factory(window['avalon']);
    }
} (function (avalon) {
    
    
var basic_tag = {    
    class: 'ms-val-class',
    display: 'ms-val-display',
    val: 'ms-val'
};

var const_type = 'val';
var const_prop = '$val';
function isArray(obj) {   
  return Object.prototype.toString.call(obj) === '[object Array]';    
}  
    /// <reference path='validator.js' />
/// <reference path='const.js' />





var _ValidObjSet = {
    getValidObj: function (binding) {
        var vmodel = this._findVm(binding.vmodels),//top vm.
            ary = binding.expr.split(':'),
            propertyName = ary[ary.length > 1 ? 1 : 0],
            result = null,
            $id = binding.args[0].$id,
            vm$val = vmodel[const_prop]
            ;
        if (!vm$val) {
            vm$val = vmodel[const_prop] = {
                bindings: {},
                valid: function () {
                    var validResult = { _len: 0 }, model = false, callback = avalon.noop, $checkId = false, args = arguments;
                    var summary = true;
                    if (args.length === 1) {
                        callback = args[0];
                    }
                    if (args.length === 2) {
                        model = args[0];
                        callback = args[1];
                    }

                    if (model) {
                        $checkId = model.$id;
                        if (model.$ups) {
                            for (var key in model.$ups) {
                                $checkId = model.$ups[key].$id
                                break;
                            }
                        }
                    }


                    for (var key in this.bindings) {
                        if (!$checkId || $checkId == key) {
                            validResult[key] = this.bindings[key];
                            
                            for (var d in validResult[key]) {                                
                                if(d!=="_len");
                                {
                                    validResult[key][d].reset();                                
                                    validResult._len++;
                                }
                            }
                            if ($checkId) {
                                break;
                            }
                        }
                    }
                    for (var key in validResult) {
                        if (key != "_len") {
                            for (var prop in validResult[key]) {
                                var vObj = validResult[key][prop];
                                vObj.valid(undefined, function (isPass) {
                                    summary = summary && isPass;
                                    validResult._len--;
                                    if (validResult._len == 0 && callback) {
                                        callback(summary);
                                    }
                                });
                            }
                        }
                    }
                },
                enable: function (groupName, enabled) {
                    if(enabled===undefined)
                    {
                        enabled=groupName;
                        groupName=false;
                    }
                     for (var key in this.bindings) {
                         var binding=this.bindings[key];
                         for(var prop in binding){
                             var vObj=binding[prop]
                             if (groupName===false || vObj.group == groupName) {
                                    vObj.disabled(!enabled);
                             }
                         }
                     }                    
                }

            };
        }
        var comp = vm$val.bindings[$id];
        if (!comp) {
            vm$val.bindings[$id] = comp = {};
        }

        result = comp[propertyName];
        if (!result) {
            result = new ValidObj(propertyName,binding);
            result.binding = binding;
            result.comp = comp;
            result.$compId = $id;
            comp[propertyName] = result;
            //avalon.log('debug', 'created validation obj in .' + const_prop + '.' + $id + '.' + propertyName);
        }
        return result;
    },
    _findVm: function (vmodels) {
        var result, $proxy = '$proxy';
        avalon.each(vmodels, function (i, v) {
            if (v.$id.substr(0, $proxy.length) === $proxy) {
                return true;
            }
            result = v;
            return false;
        });
        return result;
    }
};


    /// <reference path='init.js' />
/// <reference path='Validator.js' />
/// <reference path='../lib/avalon.js' /> 
function ValidObj(name, binding) {
    
    this.validating = false;//中间状态，验证ing，    
    this.success = '';
    this.$compId = '';
    this.error = '';
    this.validators = [];
    this.classBindings = [];//bidng of class.
    this.displayBindings = [];//bind of display   
    this.binding = binding; //binding of avalon. ms-val="XX"     
    this.disabled = function(){
        return false;
    }
    this.group = function(){
        return ''
    }
    this._isFirstVal = true; //是否为第一次验证，如果是，无论值是否相同都要执行。
    this.output = function () {
        //已经知道结果了。
        var self = this;
        var isPass = this.isPass();
        avalon.each(self.classBindings, function (i, binding) {
            var $ele=avalon(binding.element)
            var properName = getPropName(binding);
            var showOrNot = properName === 'success' ? isPass : !isPass;            
            $ele.toggleClass(binding.clz, showOrNot);            
        });       
        //output 信息        
        avalon.each(self.displayBindings, function (i, binding) {
            var properName = getPropName(binding);
            var msg = isPass ? self.success : self.error;
            switch (properName) {
                case 'success':
                    msg = isPass ? self.success : '';
                    break;
                case 'error':
                    msg = !isPass ? self.error : '';
                    break;
            }
            avalon.innerHTML(binding.element, msg);
        });
    };
    this.reset = function () {
        avalon.each(self.classBindings, function (i, binding) {
            avalon(binding.element).toggleClass(binding.clz, false);
        });
        avalon.each(self.displayBindings, function (i, binding) {
            avalon.innerHTML(binding.element, "");
        });
    }
    this.getValue = function () {
        var binding = this.binding;
        return binding.getter ? binding.getter.apply(0, binding.args) : binding.oldValue;
    };
    this.isSameValue = function (newValue) {
        if (this._isFirstVal) {
            this._isFirstVal = false;
            return false;
        }
        var binding = this.binding;
        if (!binding.getter) {
            return true;
        }
        if (newValue === undefined) {
            newValue = binding.getter.apply(0, binding.args);
        }
        return newValue && newValue === binding.oldValue; //如果新值为空，那么就需要验证其验证。否则跳过。         
    };

    this.valid = function (newValue, callback) {

        function cal_cb() {
            if (avalon.isFunction(callback)) {
                callback.call(self, self.isPass());
            }
        }

        var self = this;
        if (self.disabled()) {
            self.success = '';
            self.output();
            cal_cb();
            return;
        }
        if (newValue === undefined) {
            newValue = this.getValue();
        }
        if (this.isSameValue(newValue)) { //没有enable，那么直接验证就可以了。
            //newValue没有输入，那么检查binding是否带有getter，如果有证明值已经更改过但是还没有获取到
            //那么不需要检查.直接将上一次的结果返回就可以了。
            cal_cb();
            return;
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
            cal_cb();
        });

        function _validQueue() {
            self.validating = true;
            var validator = queue.shift();
            if (!avalon.isFunction(validator)) {
                validator.func(newValue, function (isPass) {
                    if (isPass) {
                        _validQueue(); //成功继续验证。
                    }
                    else {
                        var msg = validator.error();
                        self.error = formatMessage(msg, validator, self);
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


    this._propertyName = name;
    this.name = name;
    this.toString = function () {
        return this._propertyName;
    }
    this.isPass = function () { return this.disabled() || this.error === ''; };
    this.notifyValidators = []; //如果值发生变动，那么需要通知的其他binding
    
    this.notify = function () {
        avalon.each(this.notifyValidators, function (i, v) {
            v.vObj.valid();
        });
    };

    var formatMessage = function (content, validator, vObj) {
        var matches = content.match(/\[([^\[\]]|\[([^\[\]])*\])*\]/gi);
        avalon.each(matches, function (i, v) {
            var propName = v.substring(1, v.length - 1),
                variableName = propName, //去除中括号
                useObj = validator,
                vobj = "vObj";
            if (propName.substr(0, vobj.length) === vobj) {//如果是vObj开头用vObj的变量
                variableName = propName.split(".")[1];
                useObj = vObj;
            }
            var property = useObj[variableName];
            if (avalon.isFunction(property))
                property = property();
            content = content.replace(new RegExp('\\[' + propName + '\\]', 'ig'), property);
        });
        return content;
    };
}


function getPropName(binding) {
    var ary = binding.name.split('-')
    var propName = ary.pop();
    if (/^\d/.test(propName)) {
        return ary.pop();
    }
    return propName;

}



    function accessor(attr,defVal,type)
{
    var _attr=attr;
    var _val= defVal;
    var _type = type;
    return function(val)
    {    
        if(val===undefined)
        {
            if(_attr!=undefined)
            {            
                _val=_attr.value;           
            }   
            switch(_type){
                case 'number':
                    return parseFloat(_val);
                case 'booleam':
                    return _val=='true';
            }
            return _val;
        }           
        else{
             if(_attr!=undefined)
                _attr.value=val;
                _val=val;
        }
    }        
}

function setPropertyVal(obj, pathes, attr, vObj,value) {
    var property = pathes.pop();
    var val = value || attr.value;
    var curObj = obj, propName;
    while (pathes.length !== 0) {
        propName = pathes.shift();
        if (curObj[propName] === undefined) {
            curObj[propName] = {};
        }
        curObj = curObj[propName];
    }
    var type = typeof curObj[property];
    if(type=='undefined'){
        type=typeof val;
    }
    curObj[property] = accessor(attr,value,type);
    //avalon.log('debug', property, '=', curObj[property]);
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
                //avalon.log('warn', 'can't find', validatorName, ' defined. so add it to vali')
                aryNames = [validatorName].concat(aryNames);
                setPropertyVal(vobj, aryNames, attr, vobj); //set验证对象
                continue;
            }

            var validator = result[validatorName];
            if (!validator) {
                validator = new Validator();// this._creatorValidator(validatorCreator, aryNames, attr);
                avalon.mix(validator, validatorCreator())
                result[validatorName] = validator;
                validator.vObj = vobj;
                validator.init(binding, vobj);
            }              
            //validator.attrs[aryNames.pop()] = attr;
            setPropertyVal(validator, aryNames, attr, vobj);
        }
        for (var key in result) {
            result[key].inited(binding, vobj);
        }
        return result;
    }
};

    
function Validator() {
    this.error = function (attr) { return '输入错误请纠正'; };
    this.async = false; //async validator, if you use ajax in the this.func, please set it to true.
    this.func = false;//function (value,callback) {}
    this.init = avalon.noop; //刚刚创建Validator的时候
    this.inited = avalon.noop; //初始化接
}

    /* summary */

/// <reference path="init.js" />
/// <reference path="const.js" />
 
    
var initHandler = {
    'class': function (binding) {
        try{
        //binding.type = 'class'//强制改为class;            
        var ary = binding.expr.split(':');
        if (ary.length < 2) {
            avalon.log('error', binding.expr + '必须是', binding.expr, '="className:bindName 这种格式');
            //throw new Exception(binding.expr + ' 必须是 className:bindgName');
        }
        var newValue = ary[1]; //ary[1] + ':' + const_prop + '.' + ary[0] + '.' + info.param;            
        binding.expr = newValue;        
        binding.clz = ary[0];
        binding.oneTime = true;
        }
        catch(e){
            console.log(e);
        }
    }
};

function getTagType(name) {

    if (name.substr(0, basic_tag.class.length) === basic_tag.class) {
        return basic_tag.class;
    }
    if (name.substr(0, basic_tag.display.length) === basic_tag.display) {
        return basic_tag.display;
    }
    if (name.substr(0, basic_tag.val.length) === basic_tag.val) {
        return basic_tag.val;
    }
}

avalon.directive(const_type, {
    init: function (binding) {

        var basicType = getTagType(binding.name);

        if (basicType === basic_tag.class) {
            initHandler.class(binding);
        } else if (basicType === basic_tag.display) {
            binding.oneTime = true;
        } else if (basicType === basic_tag.val) {
            var elem = binding.element,
                bCheck = function () {
                    //updateHandler.validator.call(binding, this.value, info);
                    //var val = binding.getter ? binding.getter.apply(0, binding.args) : binding.oldValue;
                    var vObj = _ValidObjSet.getValidObj(binding);
                    vObj.valid();
                };
            avalon(elem).bind('blur', bCheck);
            binding.rollback = function () {
                avalon(elem).unbind('blur', bCheck);
            };
        }
    },
    update: function (newValue, oldValue) {        
        var binding = this;
        var vObj = _ValidObjSet.getValidObj(binding);
        if (oldValue === undefined) {
            var basicType = getTagType(binding.name);
            if (basicType === basic_tag.val) {
                vObj.validators = validatorFactory.create(binding, vObj);
                vObj.binding = this;
                return;
            }
            else if (basicType === basic_tag.class) {
                vObj.classBindings.push(binding);
            }
            else if (basicType === basic_tag.display) {
                binding.oneTime = true;
                vObj.displayBindings.push(binding);
            } else {
                avalon.log('warn', binding.name + ' do not support.');
            }
            return;
        }
        vObj.valid(newValue);
        vObj.notify();
        this.$vObj=vObj;
    }
});


  


    
    'use strict';
function getByVal(val) {
    return function () {
        return val;
    }
}
function compare(func, errorFunc) {
    return {
        compare: '',
        value: '',
        func: function (val1, cb) {
            var valFunc = this.vObj.comp[this.compare()];
            var val2;
            if (!valFunc)
                val2 = this.value();
            else
                val2 = valFunc.getValue();
            func(val1, val2, cb)
        },
        error: function () {
            var vObj = this.vObj;
            var self = this, selfName = vObj.name || vObj._propertyName,
                compareTarget = self.vObj.comp[self.compare()],
                compareText = compareTarget ? (compareTarget.name || compareTarget._propertyName) : (self.compare() || self.value());
            return errorFunc(selfName, compareText)
        },
        inited: function (binding, vobj) {

            var self = this, value = self.value(),
                compareValidObj = self.vObj.comp[self.compare()];
            if (value !== undefined)
                return;
            if (compareValidObj) {
                compareValidObj.notifyValidators.push(self);
            } else {
                for (var i = 0; i < binding.vmodels.length; i++) {
                    var vmodel = binding.vmodels[i];
                    if (vmodel[self.compare()]) {
                        self.value = getByVal(vmodel[self.compare()]);
                        vmodel.$watch(self.compare(), function (newValue) {
                            vobj.valid();
                        });
                        break;
                    }
                }
            }
        }
    };
}
function createRegex(reg, error) {
    return {
        func: function (value, cb) {
            cb(value === "" ? true : reg.test(value))
        },
        error: function () {
            return error
        }
    }
}
avalon[const_type] = {
    required: function () {
        return {
            func: function (value, cb) {
                if (isArray(value)) {
                    cb(value.length != 0)
                }
                else {
                    cb(value !== null && value !== '');
                }
            },
            error: function () {
                return '请输入[vObj.name]';
            }
        };
    },
    maxlen: function () {
        return {
            length: 10,
            func: function (value, cb) {
                var len = parseInt(this.length());
                cb(value.toString().length <= len);
            },
            error: function () {
                return '最多只能输入[length]个字符';
            }
        };
    },
    minlen: function () {
        return {
            length: 6,
            func: function (value, cb) {
                var len = parseInt(this.length());
                cb(value.toString().length >= len);
            },
            error: function () {
                return '请至少输入[length]个字符';
            }
        };
    },
    range: function () {
        return {
            min: avalon.noop,
            max: avalon.noop,
            func: function (val, cb) {
                var max = parseFloat(this.max());
                var min = parseFloat(this.min());
                if (min === NaN || max === NaN) {
                    avalon.log("error", "Please defined val-range-min/max attr for " + this.vObj._name);
                }
                var p = parseFloat(val);
                var result = (p >= min && p <= max);
                cb(result);
            },
            error: function () {
                return '请输入的数值范围在[min]和[max]之间';
            }
        };
    },
    regex: function () {
        return {
            pattern: '',
            func: function (value, cb) {
                var reg = new RegExp(this.pattern);
                cb(reg.test(value));
            },
            error: function (vObj, attr) {
                return '[vObj.name]格式不正确';
            }
        };
    },
    int: function () {
        return createRegex(/^\-?\d+$/, '请输入整数')
    },
    email: function () {
        return createRegex(/^([A-Z0-9]+[_|\_|\.]?)*[A-Z0-9]+@([A-Z0-9]+[_|\_|\.]?)*[A-Z0-9]+\.[A-Z]{2,3}$/i, '请输入正确的电子邮件');
    },
    qq: function () {
        return createRegex(/^[1-9]\d{4,10}$/, '请输入正确的qq号码')
    },
    chs: function () {
        return createRegex(/^[\u4e00-\u9fa5]+$/, "请输入中文")
    },
    eq: function () {
        return compare(function (val1, val2, cb) {
            cb(val1 == val2);
        }, function (self, compare) {
            return self + '与' + compare + '不一致';
        })
    },
    lt: function () {
        return compare(function (val1, val2, cb) {
            cb(val1 < val2);
        }, function (self, compare) {
            return '请确保' + self + '要少于' + compare;
        })
    },
    gt: function () {
        return compare(function (val1, val2, cb) {
            cb(val1 > val2);
        }, function (self, compare) {
            return '请确保' + self + '要大于' + compare;
        })
    },
    ajax: function () {
        return {
            method: 'get',
            url: '',
            data: {},
            func: function (val, cb) {
                var obj = {};
                for (var key in this.data) {
                    obj[key] = this.data[key]();
                }
                                 
                $.ajax({
                    method: this.method(),
                    url: this.url(),
                    data: obj,
                    success: function (ret) {
                        cb(ret);
                    }
                });
            },
            init: function (binding) {
                var self = this;
                for (var i = 0; i < binding.element.attributes.length; i++) {
                    var attr = binding.element.attributes[i];
                    if (/val-ajax-data-.+/i.test(attr.name)) {
                        var pathes = attr.name.substr('val-ajax-data-'.length).split('-');
                        setPropertyVal(self.data, pathes, attr, self.vObj,avalon.noop);
                    }
                }
            }
        }
    }

};

    
});

