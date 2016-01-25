/* summary */

/// <reference path="init.js" />
/// <reference path="const.js" />
(function (avalon) {

    'use strict';   
    
    /* const */
      
    /* Validator */
    
    /* ValidObj */
        
    /* init */

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


  

    /* validators */

})(avalon);