/// <reference path='validator.js' />
/// <reference path='const.js' />
'use strict';
function getAttrVal(name, vObj) {
    return function (val) {
        var _name = name;
        var _binding = vObj.binding;
        var attr = _binding.element.attributes[_name];
        var _inner = false;
        if (val === undefined) {
            if (attr)
                return attr.value;
            return _inner;
        }
        else {
            if (attr){
                attr.value = val;}
            _inner = val;
        }
    }
}
function converTo(strValue, type, attr, vObj) {
    switch (type) {
        case 'number':
            strValue = parseFloat(strValue);
            break;
        case 'booleam':
            strValue = strValue.toCaseLower() === 'true';
            break;
        case 'function': //如果原来的property是function，那么就是改为方法 都attr，面对的场景是val-required-error 这类型标签        
            strValue = getAttrVal(attr.name, vObj);
            break;
    }
    return strValue;
}

function setPropertyVal(obj, pathes, attr, vObj) {
    var property = pathes.pop();
    var val = attr.value;
    var curObj = obj, propName;
    while (pathes.length !== 0) {
        propName = pathes.shift();
        if (curObj[propName] === undefined) {
            curObj[propName] = {};
        }
        curObj = curObj[propName];
    }
    var type = typeof curObj[property];
    curObj[property] = converTo(val, type, attr,vObj);
    //avalon.log('debug', property, '=', curObj[property]);
}



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
                                validResult._len++;
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
                    _ValidObjSet._vObjLoop.call(this, function (compId, propertyName, vObj) {
                        if (vObj.group == groupName) {
                            vObj.disabled(!enabled);
                        }
                    })
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