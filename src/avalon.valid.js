/* summary */


/// <reference path="init.js" />
/// <reference path="const.js" />
(function (avalon) {

    "use strict";

    /* const */
    /* validation */
    /* init */
    avalon.directive(const_type, {
        init: function (binding) {
            if (binding.name.substr(0, basic_tag.class.length) == basic_tag.class) {
                initHandler.class(binding);
            } else if (binding.name.substr(0, "ms-val-display".length) == "ms-val-display") {
                binding.oneTime = true;
            } else if (binding.name == basic_tag.val) {
                var elem = binding.element;
                avalon(elem).bind('blur', bCheck)
                binding.roolback = function () {
                    avalon(elem).unbind("blur", bCheck)
                }
                function bCheck() {
                    //updateHandler.validator.call(binding, this.value, info);
                    var val = binding.getter ? binding.getter.apply(0, binding.args) : binding.oldValue;
                    _ValidObjSet.getValidObj(binding).valid(val);
                }
            }
        },
        update: function (newValue, oldValue) {
            var isFirst = oldValue === undefined;//第一次绑定，不需要验证。
            var binding = this;
            var vObj = _ValidObjSet.getValidObj(binding);
            if (isFirst) {
                console.log("init " + binding.uniqueNumber);
                //ms-val="prop"
                //ms-val-display="prop"
                //ms-val-class="class:prop"
                
                if (binding.name == basic_tag.val) {
                    if (binding.name == basic_tag.val) {
                        var validators = validatorFactory.create(binding, vObj);
                        vObj.validators = validators;
                        initHandler.validator(binding);
                    }
                    return;
                }
                else if (binding.name.substr(0, basic_tag.class.length) == basic_tag.class) {
                    vObj.classBindings.push(binding);
                }
                else if (binding.name.substr(0, "ms-val-display".length) == "ms-val-display") {
                    binding.oneTime = true;
                    vObj.displayBindings.push(binding);
                } else {
                    avalon.log("warn", binding.name + " do not support.")
                }
                vObj.value = newValue;
                return;
            }
            vObj.valid(newValue);
            vObj.notify();
        }
    })


    var initHandler = {
        validator: function (binding) {
            return;
            var elem = binding.element;
            avalon(elem).bind('blur', bCheck)
            binding.roolback = function () {
                avalon(elem).unbind("blur", bCheck)
            }
            function bCheck() {
                //updateHandler.validator.call(binding, this.value, info);
                var val = binding.getter.apply(0, binding.args);
                _ValidObjSet.getValidObj(binding).valid(val);
            }
        },
        "class": function (binding, info) {
            //binding.type = "class"//强制改为class;            
            var ary = binding.expr.split(':');
            if (ary.length < 2) {
                avalon.log("error", binding.expr + " 必须是 className:bindgName")
                throw new Exception(binding.expr + " 必须是 className:bindgName");
            }
            var newValue = ary[1]; //ary[1] + ":" + const_prop + "." + ary[0] + "." + info.param;            
            binding.expr = newValue;
            binding.clz = ary[0];
            binding.oneTime = true;
        }

    }

     

    /* validators */
    /* message */
    /* group */

})(avalon)