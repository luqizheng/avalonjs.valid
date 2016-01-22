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
                    for (var key in this) {

                        if (key == "valid")
                            continue;
                        validResult.push(key);
                    }

                    while (validResult.length != 0) {
                        var key = validResult.shift();
                        this[key].valid(undefined, function (isPass) {
                            avalon.log(this.name);
                            summary = summary && isPass;
                            avalon.Array.remove(validResult, this.name);
                            if (validResult.length == 0) {
                                callback(summary)
                            }
                        });
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