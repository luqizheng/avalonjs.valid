/*!
avalon.valid Copyright(c) 2011 Leo.lu  MIT Licensed
https://github.com/luqizheng/avalon.valid.js 
*/

/// <reference path="init.js" />
/// <reference path="const.js" />
(function (avalon) {

    'use strict';   
    
    
var basic_tag = {    
    class: 'ms-val-class',
    display: 'ms-val-display',
    val: 'ms-val'
};

var const_type = 'val';
var const_prop = '$val';

      
    
function Validator() {
    this.error = function () { return '输入错误情纠正'; };
    this.async = false; //async validator, if you use ajax in the this.func, please set it to true.
    this.func = false;//function (value,callback) {}
    this.init = avalon.noop;
}

    
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
    this.enabled=true;
    this.group="";  
    
    
    this._isFristVal=true; //是否为第一次验证，如果是，无论值是否相同都要执行。
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
        if(this._isFristVal)
        {
            this._isFirstVal=false;
            return false;
        }
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
        if(!self.enabled)
        {
            return ;
        }
         if(newValue===undefined){
            newValue = this.getValue();
        }        
        if (this.isSameValue(newValue)) { //没有enable，那么直接验证就可以了。
            //newValue没有输入，那么检查binding是否带有getter，如果有证明值已经更改过但是还没有获取到
            //那么不需要检查.直接将上一次的结果返回就可以了。
            if(avalon.isFunction(callback)){
                callback.call(self, self.isPass());               
            }       
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
            if(callback){
                callback.call(self, self.isPass());
            }
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
    this.isPass = function () { return !this.enabled || this.error === ''; };
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
            var propName = v.substring(1, v.length - 1),
                variableName=propName, //去除中括号
                useObj=validator,
                vobj="vObj";
            if(propName.substr(0,vobj.length)===vobj){//如果是vObj开头用vObj的变量
                variableName = propName.split(".")[1];
                useObj=vObj;
            }
            content = content.replace(new RegExp('\\[' + propName + '\\]', 'ig'), useObj[variableName]);
        });
        return content;
    };

}




        
    /// <reference path='validator.js' />
/// <reference path='const.js' />
'use strict';
function converTo(strValue, type) {
    switch (type) {
        case 'number':
            strValue = parseFloat(strValue);
            break;
        case 'booleam':
            strValue = strValue.toCaseLower() === 'true';
            break;
        case 'function': //如果原来的property是function，那么就是改为方法 都attr，面对的场景是val-required-error 这类型标签
            strValue = function () {
                return this.attr.value;
            };
            break;
    }
    return strValue;
}

function setPropertyVal(obj, pathes, val, type) {
    var property = pathes.pop();
    var curObj = obj, propName;
    while (pathes.length !== 0) {
        propName = pathes.shift();
        curObj = curObj[propName];
        if (curObj === undefined) {
            avalon.log('warn', propName, 'is not exist.');
            return false;
        }
    }
    if (!type) { //如果没有设置 type值，那么类型就是他自己本身的类型
        type = typeof curObj[property];
    }
    curObj[property] = converTo(val, type);
    //avalon.log('debug', property, '=', curObj[property]);
}



var _ValidObjSet = {
    getValidObj: function (binding) {
        var vmodel = this._findVm(binding.vmodels),//top vm.
            ary = binding.expr.split(':'),
            propertyName = ary[ary.length > 1 ? 1 : 0],
            result = null,
            $id = binding.args[0].$id;
        if (!vmodel[const_prop]) {
            vmodel[const_prop] = {
                valid: function (callback) {
                    var validResult = [];
                    var summary = true;
                    _ValidObjSet._vObjLoop.call(this, function (compId, propertyName) {
                        validResult.push(compId + '.' + propertyName);
                    });

                    _ValidObjSet._vObjLoop.call(this, function (compId, propertyName, vObj) {
                        vObj.valid(undefined, function (isPass) {
                            summary = summary && isPass;
                            avalon.Array.remove(validResult, this.$compId + '.' + this._name);
                            if (!validResult.length) {
                                callback(summary);
                            }
                        });
                    });
                },
                enable: function (groupName, enabled) {
                    _ValidObjSet._vObjLoop.call(this, function (compId, propertyName, vObj) {
                        if (vObj.group == groupName) {
                            vObj.enabled = enabled;                            
                        }
                    })
                }

            };
        }
        var comp = vmodel[const_prop][$id];
        if (!comp) {
            vmodel[const_prop][$id] = comp = {};
        }

        result = comp[propertyName];
        if (!result) {
            result = new ValidObj(propertyName);
            result.binding = binding;
            result.comp = comp;
            result.$compId = $id;
            comp[propertyName] = result;
            avalon.log('debug', 'created validation obj in .' + const_prop + '.' + $id + '.' + propertyName);
        }
        return result;
    },
    _findVm: function (vmodels) {
        var result;
        avalon.each(vmodels, function (i, v) {
            if (v.$id.substr(0, '$proxy'.length) === '$proxy') {
                return true;
            }
            result = v;
            return false;
        });
        return result;
    },
    _vObjLoop: function (action) {
        for (var compId in this) {
            if (compId === 'valid') {
                continue;
            }
            for (var propertyName in this[compId]) {
                action.call(this, compId, propertyName, this[compId][propertyName]);
            }
        }
    }
};

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
    _creatorValidator: function (validatorCreator, pathes, attr) { //创建验证其的时候，可以附带一个属性值
        var result = new Validator();
        result.attr = attr;
        var setting = validatorCreator();
        var propName = pathes.length > 0 ? pathes[pathes.length - 1] : false;//看看有没有属性值，如果有就要设置
        avalon.mix(result, setting);

        if (propName) {
            setPropertyVal(result, pathes, attr.value);
        }
        return result;
    }
};

    var initHandler = {
        'class': function (binding) {
            //binding.type = 'class'//强制改为class;            
            var ary = binding.expr.split(':');
            if (ary.length < 2) {
                avalon.log('error', binding.expr + ' 必须是 className:bindgName');
                //throw new Exception(binding.expr + ' 必须是 className:bindgName');
            }
            var newValue = ary[1]; //ary[1] + ':' + const_prop + '.' + ary[0] + '.' + info.param;            
            binding.expr = newValue;
            binding.clz = ary[0];
            binding.oneTime = true;
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
                binding.roolback = function () {
                    avalon(elem).unbind('blur', bCheck);
                };
            }
        },
        update: function (newValue, oldValue) {
            var isFirst = oldValue === undefined;//第一次绑定，不需要验证。
            var binding = this;
            var vObj = _ValidObjSet.getValidObj(binding);
            if (isFirst) {
                var basicType = getTagType(binding.name);
                if (basicType === basic_tag.val) {
                    vObj.validators = validatorFactory.create(binding, vObj);
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
        }
    });


  

    'use strict'; 
avalon[const_type] = {
    required: function () {
        return {
            func: function (value, cb) {
                cb(value !== null && value !== '');
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
                var len = parseInt(this.length);
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
                var len = parseInt(this.length);
                cb(value.toString().length >= len);
            },
            error: function () {
                return '请至少输入[length]个字符';
            }
        };
    },
    range: function () {
        return {
            min: 1,
            max: 200,
            func: function (val, cb) {
                var max = parseFloat(this.max.val());
                var min = parseFloat(this.min.val());
                var p = parseFloat(val);
                var result = (p >= min && p <= max);
                cb(result);
            },
            error: function () {
                return '请输入的数值范围在[min]和[max]之间';
            }
        };
    },
    equal: function () {
        return {
            compare: '',
            func: function (val, cb) {
                var data = this.vObj.comp[this.compare].getValue();
                cb(data == val);
            },
            error: function (vObj) {
                var self = vObj.desc || vObj.name, compareTarget = this.vObj.comp[this.compare],
                    compareText = compareTarget.name || compareTarget._name;
                return self + '与' + compareText + '不一致';
            },
            init: function (binding, vobj) {
                var compareValidObj = this.vObj.comp[this.compare];
                compareValidObj.notifyValidators.push(this);
            }
        };
    },
    regex: function () {
        return {
            pattern: '',
            func: function (val, cb) {
                var reg = new RegExp(this.pattern);
                cb(reg.test(val));
            },
            error: function (vObj) {
                return (vObj.name || vObj._name) + '不正确';
            }
        };
    }  
};

})(avalon);