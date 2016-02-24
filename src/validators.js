'use strict';
function getByVal(val) {
    return function () {
        return val;
    }
}
function compare(func, errorFunc) {
    return {
        compare: '',
        value: avalon.noop,
        func: function (val1, cb) {
            var valFunc = this.vObj.comp[this.compare()];
            var val2;
            if (!valFunc)
                val2 = this.value();
            else
                val2 = valFunc.getValue();
            func(val1, val2, cb)
        },
        error: function () {
            var vObj = this.vObj;
            var self = this, selfName = vObj.name || vObj._propertyName,
                compareTarget = self.vObj.comp[self.compare()],
                compareText = compareTarget ? (compareTarget.name || compareTarget._propertyName) : (self.compare() || self.value());
            return errorFunc(selfName, compareText)
        },
        inited: function (binding, vobj) {

            var self = this, value = self.value(),
                compareValidObj = self.vObj.comp[self.compare()];
            if (value !== undefined)
                return;
            if (compareValidObj) {
                compareValidObj.notifyValidators.push(self);
            } else {
                for (var i = 0; i < binding.vmodels.length; i++) {
                    var vmodel = binding.vmodels[i];
                    if (vmodel[self.compare()]) {
                        self.value = getByVal(vmodel[self.compare()]);
                        vmodel.$watch(self.compare(), function (newValue) {
                            vobj.valid();
                        });
                        break;
                    }
                }
            }
        }
    };
}
function createRegex(reg, error) {
    return {
        func: function (value, cb) {
            cb(value === "" ? true : reg.test(value))
        },
        error: function () {
            return error
        }
    }
}
avalon[const_type] = {
    required: function () {
        return {
            func: function (value, cb) {
                if (isArray(value)) {
                    cb(value.length != 0)
                }
                else {
                    cb(value !== null && value !== '');
                }
            },
            error: function () {
                return '请输入[vObj.name]';
            }
        };
    },
    maxlen: function () {
        return {
            length: 10,
            func: function (value, cb) {
                var len = parseInt(this.length());
                cb(value.toString().length <= len);
            },
            error: function () {
                return '最多只能输入[length]个字符';
            }
        };
    },
    minlen: function () {
        return {
            length: 6,
            func: function (value, cb) {
                var len = parseInt(this.length());
                cb(value.toString().length >= len);
            },
            error: function () {
                return '请至少输入[length]个字符';
            }
        };
    },
    range: function () {
        return {
            min: avalon.noop,
            max: avalon.noop,
            func: function (val, cb) {
                var max = parseFloat(this.max());
                var min = parseFloat(this.min());
                if (min === NaN || max === NaN) {
                    avalon.log("error", "Please defined val-range-min/max attr for " + this.vObj._name);
                }
                var p = parseFloat(val);
                var result = (p >= min && p <= max);
                cb(result);
            },
            error: function () {
                return '请输入的数值范围在[min]和[max]之间';
            }
        };
    },
    regex: function () {
        return {
            pattern: '',
            func: function (value, cb) {
                var reg = new RegExp(this.pattern);
                cb(reg.test(value));
            },
            error: function (vObj, attr) {
                return '[vObj.name]格式不正确';
            }
        };
    },
    int: function () {
        return createRegex(/^\-?\d+$/, '请输入整数')
    },
    email: function () {
        return createRegex(/^([A-Z0-9]+[_|\_|\.]?)*[A-Z0-9]+@([A-Z0-9]+[_|\_|\.]?)*[A-Z0-9]+\.[A-Z]{2,3}$/i, '请输入正确的电子邮件');
    },
    qq: function () {
        return createRegex(/^[1-9]\d{4,10}$/, '请输入正确的qq号码')
    },
    chs: function () {
        return createRegex(/^[\u4e00-\u9fa5]+$/, "请输入中文")
    },
    eq: function () {
        return compare(function (val1, val2, cb) {
            cb(val1 == val2);
        }, function (self, compare) {
            return self + '与' + compare + '不一致';
        })
    },
    lt: function () {
        return compare(function (val1, val2, cb) {
            cb(val1 < val2);
        }, function (self, compare) {
            return '请确保' + self + '要少于' + compare;
        })
    },
    gt: function () {
        return compare(function (val1, val2, cb) {
            cb(val1 > val2);
        }, function (self, compare) {
            return '请确保' + self + '要大于' + compare;
        })
    },
    ajax: function () {
        return {
            method: 'get',
            url: '',
            data: {},
            func: function (val, cb) {
                var obj = {};
                for (var key in this.data) {
                    obj[key] = this.data[key]();
                }
                                 
                $.ajax({
                    method: this.method,
                    url: this.url,
                    data: obj,
                    success: function (ret) {
                        cb(ret);
                    }
                });
            },
            init: function (binding) {
                var self = this;
                for (var i = 0; i < binding.element.attributes.length; i++) {
                    var attr = binding.element.attributes[i];
                    if (/val-ajax-data-.+/i.test(attr.name)) {
                        var pathes = attr.name.substr('val-ajax-data-'.length).split('-');
                        setPropertyVal(self.data, pathes, attr, self.vObj,avalon.noop);
                    }
                }
            }
        }
    }

};