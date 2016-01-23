'use strict';
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
    },
    equal: function () {
        return {
            compare: '',
            func: function (val, cb) {
                var data = this.vObj.comp[this.compare].getValue();
                cb(data == val);
            },
            error: function (vObj,attr) {
                var self = vObj.name || vObj._propertyName,
                    compareTarget = this.vObj.comp[this.compare],
                    compareText = compareTarget.name || compareTarget._propertyName;
                return self + '与' + compareText + '不一致';
            },
            init: function (binding, vobj) {
                var compareValidObj = this.vObj.comp[this.compare];
                compareValidObj.notifyValidators.push(this);
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
                return '[vObj.name]不正确';
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
    }

};