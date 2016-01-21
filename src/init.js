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