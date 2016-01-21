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
            //console.log("init " + binding.expr);
            //ms-val="prop"
            //ms-val-display="prop"
            //ms-val-class="class:prop"
            var vObj = _ValidObjSet.getValidObj(binding);
            if (binding.name == "ms-val") {
                var validators = validatorFactory.create(binding.element);
                vObj.validators = validators;
                initHandler.validator(binding);
                return;
            }
            else if (binding.name.substr(0, "ms-val-class".length) == "ms-val-class") {
                initHandler.class(binding);
                vObj.classBindings.push(binding);
            }
            else if (binding.name.substr(0, "ms-val-display".length) == "ms-val-display") {
                binding.oneTime = true;
                vObj.displayBindings.push(binding);
            }           
        },
        update: function (newValue, oldValue) {
            var isFirst = oldValue === undefined;//第一次绑定，不需要验证。
            var binding = this;           
            var vobj = _ValidObjSet.getValidObj(this);
            if (isFirst) {
                vobj.value = newValue;
                return;
            }
            vobj.valid(newValue);            
        }
    })


    var initHandler = {
        validator: function (binding) {
            var elem=binding.element;
            avalon(elem).bind('blur', bCheck)
            binding.roolback = function () {
                avalon(elem).unbind("blur", bCheck)
            }
            function bCheck() {
                //updateHandler.validator.call(binding, this.value, info);
                _ValidObjSet.getValidObj(binding).valid(this.value);
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