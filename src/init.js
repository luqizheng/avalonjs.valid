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