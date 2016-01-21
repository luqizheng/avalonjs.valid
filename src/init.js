/// <reference path="validation.js" />
var _ValidObjSet = {
    getValidObj: function (binding) {
        var vmodel = binding.vmodels[0],
            ary = binding.expr.split(':'),            
            propertyName = ary[ary.length>1?1:0],
            result = null;
        avalon.log("debug create validObj for ",propertyName)
        if (!vmodel[const_prop]) {            
            vmodel[const_prop] = {
                valida:function(){
                    
                }
            }
        }
        result = vmodel[const_prop][propertyName]
        if (!result) {            
            result = new ValidObj(propertyName);            
            vmodel[const_prop][propertyName] = result;
        }
        return result;
    }
 }


var msgRegex = /\[([^\[\]]|\[([^\[\]])*\])*\]/gi;

var validatorFactory = {
    create: function (element) {
        
        var result = {};
        for (var i = 0; i < element.attributes.length; i++) {
            var attr = element.attributes[i];
            if (!/^val-/gi.test(attr.name)) {
                continue;
            }
            var aryNames = attr.name.substr(4).split('-');
            var prop = aryNames.pop();
            if (aryNames.length == 0)
                continue;
            var validatorName = aryNames.shift();
            var validatorCreator = avalon[const_type][validatorName];
            if (!validatorCreator) {
                avalon.log("warn", "can't find", validatorName, " defined.")
                continue;
            }
            
            var validator = result[validatorName];
            if(!validator) {            
                validator=this._creatorValidator(validatorCreator, aryNames, prop, attr);
                result[validatorName]=validator;
            }
        }
        
        return result;
    },
    _creatorValidator: function (validatorCreator, pathes, propName, attr) {
        var result = new Validator();
        var setting = validatorCreator();
        var val=attr.val;
        avalon.mix(result, setting);
        
        var curObj = result;
        while (pathes.length != 0) {
            curObj = curObj[pathes.shift()];
            if (curObj === undefined) {
                avalon.log("warn", propName, "is not exist.")
                return result;
            }
        }
        if(propName=="error"){
            curObj[propName]=this._createAttributeReader(attr)
        }
        else{
            curObj[propName] = converTo(val,curObj[propName]);
        }
        avalon.log("debug",propName,"=",curObj[propName]);
        return result;
    },
    _createAttributeReader: function (attr) {
        return {
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
    }   

}

 function converTo(strValue,targrValue){
        var type=typeof targrValue
         switch (type) {
            case "number":
                strValue = parseFloat(strValue);
            case "booleam":
                strValue = strValue.toCaseLower() == "true"
        }
        return strValue;
    }