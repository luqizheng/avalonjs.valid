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
            var valFunc = this.vObj.comp[this.compare];
            var val2;
            if (!valFunc)
                val2 = this.value();
            else
                val2 = valFunc.getValue();
            func(val1, val2, cb)
        },
        error: function (vObj) {
            var self = vObj.name || vObj._propertyName,
                compareTarget = this.vObj.comp[this.compare],
                compareText = compareTarget ? (compareTarget.name || compareTarget._propertyName) : (this.compare || this.value());
            return errorFunc(self, compareText)
        },
        init: function (binding, vobj) {
            var compareValidObj = this.vObj.comp[this.compare], self = this;
            if (compareValidObj) {
                compareValidObj.notifyValidators.push(this);
            } else {
                for (var i = 0; i < binding.vmodels.length; i++) {
                    var vmodel = binding.vmodels[i];
                    if (vmodel[this.compare]) {
                        self.value = getByVal(vmodel[this.compare]);
                        vmodel.$watch(this.compare, function (newValue) {
                            self.valid();
                        });
                        break;
                    }
                }
            }
        }
    };
}
avalon[const_type] = {
    required: function () {
        return {
            func: function (value, cb) {
                cb(value !== null && value !== '');
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
                var len = parseInt(this.length);
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
                var len = parseInt(this.length);
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
    }, regex: function () {
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
        return {
            func: function (value, cb) {
                cb(/^\-?\d+$/.test(value));
            },
            error: function (vObj) {
                return '请输入整数';
            }
        }
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
            return "请确保" + self + '要少于' + compare;
        })
    },
    gt: function () {
        return compare(function (val1, val2, cb) {
            cb(val1 > val2);
        }, function (self, compare) {
            return "请确保" + self + '要大于' + compare;
        })
    }
  
};