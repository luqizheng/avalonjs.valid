/// <reference path='validator.js' />
/// <reference path='const.js' />

var _ValidObjSet = {
    getValidObj: function (binding) {
        var vmodel = this._findVm(binding.vmodels),//top vm.
            ary = binding.expr.split(':'),
            propertyName = ary[ary.length > 1 ? 1 : 0],
            result = null,
            $id = binding.args[0].$id,
            vm$val = vmodel[const_prop]
            ;
        if (!vm$val) {
            vm$val = vmodel[const_prop] = {
                bindings: {},
                valid: function () {
                    var validResult = { _len: 0 }, model = false, callback = avalon.noop, $checkId = false, args = arguments;
                    var summary = true;
                    if (args.length === 1) {
                        callback = args[0];
                    }
                    if (args.length === 2) {
                        model = args[0];
                        callback = args[1];
                    }

                    if (model) {
                        $checkId = model.$id;
                        if (model.$ups) {
                            for (var key in model.$ups) {
                                $checkId = model.$ups[key].$id
                                break;
                            }
                        }
                    }


                    for (var key in this.bindings) {
                        if (!$checkId || $checkId == key) {
                            validResult[key] = this.bindings[key];

                            for (var d in validResult[key]) {
                                if (d !== "_len");
                                {
                                    validResult[key][d].reset();
                                    validResult._len++;
                                }
                            }
                            if ($checkId) {
                                break;
                            }
                        }
                    }
                    var errorMessage = [];
                    for (var key in validResult) {
                        if (key != "_len") {
                            for (var prop in validResult[key]) {
                                var vObj = validResult[key][prop];
                                vObj.valid(undefined, function (isPass, msg) {
                                    summary = summary && isPass;
                                    if (!isPass) {
                                        errorMessage.push({ msg: msg, vObj: vObj.name });
                                    }
                                    validResult._len--;
                                    if (validResult._len == 0 && callback) {
                                        callback(summary, errorMessage);
                                    }
                                });
                            }
                        }
                    }
                },
                enable: function (enabled, groupName) {
                    for (var key in this.bindings) {
                        var binding = this.bindings[key];
                        for (var prop in binding) {
                            var vObj = binding[prop]
                            if (groupName === undefined || vObj.group() == groupName) {
                                vObj.disabled(!enabled);
                            }
                        }
                    }
                },
                reset: function () {
                    for (var key in this.bindings) {
                        var binding = this.bindings[key];
                        for (var prop in binding) {
                            var vObj = binding[prop]
                            vObj.reset();
                        }
                    }
                }
            };
        }
        var comp = vm$val.bindings[$id];
        if (!comp) {
            vm$val.bindings[$id] = comp = {};
        }

        result = comp[propertyName];
        if (!result) {
            result = new ValidObj(propertyName, binding);
            result.binding = binding;
            result.comp = comp;
            result.$compId = $id;
            comp[propertyName] = result;
            //avalon.log('debug', 'created validation obj in .' + const_prop + '.' + $id + '.' + propertyName);
        }
        return result;
    },
    _findVm: function (vmodels) {
        var result, $proxy = '$proxy';
        avalon.each(vmodels, function (i, v) {
            if (v.$id.substr(0, $proxy.length) === $proxy) {
                return true;
            }
            result = v;
            return false;
        });
        return result;
    }
};

