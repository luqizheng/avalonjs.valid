avalon[const_type] = {
    required: function () {
        return {
            func: function (value, cb) {
                cb(value != null && value != "")
            }
        }
    },
    maxlen: function () {
        return {
            length: 10,
            func: function (value, cb) {
                var len = parseInt(this.length)
                cb(value.toString().length <= len);
            }
        }
    },
    minlen: function () {
        return {
            length: 6,
            func: function (value, cb) {
                var len = parseInt(this.length)
                cb(value.toString().length >= len);
            }
        }
    },
    range: function () {
        return {
            min: false,
            max: false,
            func: function (val, cb) {
                var max = parseFloat(this.max.val())
                var min = parseFloat(this.min.val());
                var p = parseFloat(val);
                var result = (p >= min && p <= max)
                avalon.log("range " + result);
                cb(result);
            }
        }
    }

}