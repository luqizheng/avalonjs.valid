function accessor(vObj, name, defVal, type) {
    var _name = name;
    var _val = defVal;
    var _type = type;
    var _vObj = vObj;

    return function (val) {
        var attr = _vObj.binding.element.attributes[_name];
        if (val === undefined) {
            if (attr) {
                _val = attr.value;
            }
            switch (_type) {
                case 'number':
                    return parseFloat(_val);
                case 'boolean':
                    return _val == 'true' && attr != undefined; //当attr 使用 true、false表示数值的时候，avalon会移除attr为false的
            }
            //console.log(_name + "=" + _val + "(" + type + ")");
            return _val;
        }
        else {
            if (attr)
                attr.value = val;
            _val = val;
        }
    }
}

function setPropertyValByAttr(obj, pathes, vObj, attr) {
    var property = pathes.pop();
    var curObj = obj, propName;
    while (pathes.length !== 0) {
        propName = pathes.shift();
        if (curObj[propName] === undefined) {
            curObj[propName] = {};
        }
        curObj = curObj[propName];
    }
    var type = typeof curObj[property];
    if (type == 'undefined' || type == 'function' || type == 'object') {
        type = 'string';
    }
    curObj[property] = accessor(vObj, attr.name, attr.value, type);
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
                var val = vobj[validatorName];
                var type = typeof val;
                if (type == 'function') {
                    val = val.call(vobj);
                    type = typeof val;
                }
                //console.log('set the vobject property ' + validatorName + ',val=' + val + ",type=" + type);
                vobj[validatorName] = accessor(vobj, attr.name, attr.value, type);
                continue;
            }

            var validator = result[validatorName];
            if (!validator) { 
                validator = new Validator();// this._creatorValidator(validatorCreator, aryNames, attr);                
                avalon.mix(validator, validatorCreator())
                result[validatorName] = validator;
                validator.vObj = vobj;
            }
            if (aryNames.length != 0) {
                setPropertyValByAttr(validator, aryNames, vobj, attr);
            }
        }
        for (var key in result) {
            var validator = result[key];
            //把validator的属性变为方法。
            //经过上面的初始化，凡是attribute有定义的属性，应该都变为方法获取和设置，剩下的应该就是普通的属性。
            for (var name in validator) {
                var typeOrProp = typeof validator[name]
                if (typeOrProp != 'function' && typeOrProp != 'object') { //把普通属性的变为方法获取                   
                    validator[name] = accessor(vobj, name, validator[name], typeOrProp)
                }
            }
            validator.inited(binding, vobj);
        }
        return result;
    }
};
