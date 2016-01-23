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
            min: 1,
            max: 200,
            func: function (val, cb) {
                var max = parseFloat(this.max.val());
                var min = parseFloat(this.min.val());
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
            error: function (vObj) {
                var self = vObj.desc || vObj.name, compareTarget = this.vObj.comp[this.compare],
                    compareText = compareTarget.name || compareTarget._name;
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
            patten: '',
            func: function (val, cb) {
                var reg = new RegExp(this.patten);
                cb(reg.text(val));
            },
            error: function (vObj) {
                return (vObj.name || vObj._name) + '不正确';
            }
        };
    }  
};