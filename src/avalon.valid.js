/* summary */


/// <reference path="init.js" />
/// <reference path="const.js" />
(function (avalon) {

    
    /* const */
    /* validation */
    /* init */
    avalon.directive(const_type, {
        init: function (binding) {
            //console.log("init " + binding.expr);
            var info = anaylz(binding);      
            //这里只处理验证器就可以了            
            if (isValidator(info.name)) {
                initHandler.validator(binding, info);
            } else {
                var method = initHandler[info.name];

                if (method)
                    method(binding, info);
                else {
                    avalon.log("warning", info.name, "is not a validation")
                }
            }
        },
        update: function (newValue, oldValue) {
            var isFirst = oldValue === undefined;//第一次绑定，不需要验证。
            var binding = this;
            var info = anaylz(binding);
            if (isFirst) {              
                //displayBinding  cssBindg 只运行一次，因此。。。
                if (!isValidator(info.name)) {
                    var vobj = getValidObj(this);
                    /*if (info.name == "class")
                        vobj.clzBinding.push(this);
                    if (info.name == "display")
                        vobj.displays.push(this)*/
                    vobj[info.name + "Bindings"].push(this)
                }
                return;
            }


            console.log("call output " + info.name)
            if (isValidator(info.name)) {
                updateHandler.validator.call(this, newValue, info);
            }
        }
    })


    var initHandler = {
        validator: function (binding, info) {
            var vObjIns = getValidator(binding);
            var elem = binding.element;
            var vObjExtends = avalon[const_type][info.name]
            if (!vObjExtends) {
                avalon.log("warning", info.name + " validator can't be found in avalon[" + const_type + "]");
            }
            avalon.mix(vObjIns, vObjExtends());
            setProperties(binding, vObjIns, binding.expr)

            avalon(elem).bind('blur', bCheck)

            binding.roolback = function () {
                avalon(elem).unbind("click", bCheck)
            }
            function bCheck() {
                updateHandler.validator.call(binding, this.value, info);
            }
        },
        display: function (binding, info) {
            binding.oneTime = true;
            //binding.priority-=500;
        },
        "class": function (binding, info) {
            //binding.type = "class"//强制改为class;            
            var ary = binding.expr.split(':');
            if (ary.length < 2) {
                avalon.log("error", binding.expr + " 必须是 className:bindgName")
                throw new Exception(binding.expr + " 必须是 className:bindgName");
            }
            //binding.name="ms-class"
            //binding.param="";
            //binding.type="class";
            var newValue = ary[1]; //ary[1] + ":" + const_prop + "." + ary[0] + "." + info.param;
            //console.log(newValue);
            binding.expr = newValue;
            binding.clz = ary[0];
            binding.oneTime = true;
            //binding.priority-=500;
        }

    }

    var updateHandler = {
        validator: function (newValue, info) {
            var binding = this;
            var vobj = getValidObj(binding);
            var validator = vobj.validators[info.name];
            if (validator.async) {
                vobj.validating = true;
            }
            validator.func(newValue, function (isPass) {
                validator.isPass = isPass;
                vobj.validating = false;                
                //var message = isPass ? "success" : "error";
                //vobj[message] = validator[message].msg();
                //console.log(vobj.success + "," + vobj.error)
                vobj.invokeResult();
            })
        }
    }

    function isValidator(name) {
        return name != "display" && name != "class";
    } 

    /* validators */
    /* message */
    /* group */

})(avalon)