/* summary */

/// <reference path="init.js" />
/// <reference path="const.js" />
 
    
var initHandler = {
    'class': function (binding) {
        try {
            //binding.type = 'class'//强制改为class;            
            var ary = binding.expr.split(':');
            if (ary.length < 2) {
                avalon.log('error', binding.expr + '必须是', binding.expr, '="className:bindName ');
                //throw new Exception(binding.expr + ' 必须是 className:bindgName');
            }
            var newValue = ary[1]; //ary[1] + ':' + const_prop + '.' + ary[0] + '.' + info.param;            
            binding.expr = newValue;
            binding.clz = ary[0];
            binding.oneTime = true;
        }
        catch (e) {
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
            var elem = avalon(binding.element),
                bCheck = function () {
                    //updateHandler.validator.call(binding, this.value, info);
                    //var val = binding.getter ? binding.getter.apply(0, binding.args) : binding.oldValue;
                    var vObj = _ValidObjSet.getValidObj(binding);
                    vObj.valid();
                };                
            elem.bind('blur', bCheck);
            binding.rollback = function () {
                elem.unbind('blur', bCheck);
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
                vObj.binding=binding;//要重新设置一次。因为有可能class、display提前就生成了这个对象。         
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
        this.$vObj = vObj;
    }
});


  

