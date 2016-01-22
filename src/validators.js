avalon[const_type] = {
    required: function () {
        return {
            func: function (value, cb) {
                cb(value != null && value != "")
            },
            error: function (vObj) {
                return "请输入" + vObj.name + "的值"
            }
        }
    },
    maxlen: function () {
        return {
            length: 10,
            func: function (value, cb) {
                var len = parseInt(this.length)
                cb(value.toString().length <= len);
            },
            error: function (vObj) {
                return "最多只能输入" + this.length + "个字符";
            }

        }
    },
    minlen: function () {
        return {
            length: 6,
            func: function (value, cb) {
                var len = parseInt(this.length)
                cb(value.toString().length >= len);
            },
            error: function (vObj) {
                return "请至少输入[length]个字符";
            }
        }
    },
    range: function () {
        return {
            min: 1,
            max: 200,
            func: function (val, cb) {
                var max = parseFloat(this.max.val())
                var min = parseFloat(this.min.val());
                var p = parseFloat(val);
                var result = (p >= min && p <= max)
                cb(result);
            },
            error: function (vObj) {
                return "请输入的数值范围在[min]和[max]之间";
            }
        }
    },
    equal: function () {
        return {
            compare: "",
            func: function (val, cb) {
                var binding = this.vObj.comp[this.compare].binding;
                var data = binding.getter.apply(0, binding.args);
                cb(data == val);
            },
            error: function (vObj) {
                return "不一致"
            },
            init:function(binding, vobj){
                var compareValidObj = this.vObj.comp[this.compare]
                compareValidObj.notifyValidators.push(this);
            }
        }
    }

}