function getAttrVal(name, vObj) {
    
    return function (val) {
        var _name = name;
        var _binding = vObj.binding;
        var attr = _binding.element.attributes[_name];
        if (val === undefined) {
            if (attr)
                return attr.value;
            return (typeof _inner==='undefined')?false:_inner;
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
    curObj[property] = converTo(val, type, attr,vObj);
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
