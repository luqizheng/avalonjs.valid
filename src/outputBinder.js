function _output(binding, vObj, action) {

    this.binding = binding;

    this.output = function (bValid) {
        if (this.forError && this.forSuccess) {
            action.call(this, this.binding, bValid)
        }
        else if (this.forError) {
            action.call(this, this.binding, !bValid)
        }
        else {
            action.call(this, this.binding, bValid);
        }
    }

    this.reset = function () {
        action(this.binding, false);
    }

    function getPropName(binding) {
        var ary = binding.name.split('-')
        var propName = ary.pop();
        if (/^\d/.test(propName)) {
            return ary.pop();
        }
        return propName;

    }
    this.forSuccess = true;
    this.forError = true;
    //构造函数    
    this.init = function () {
        var properName = getPropName(binding);
        if (properName == 'error') {
            this.forSuccess = false;
        }
        else if (properName == 'success') {
            this.forError = false;
        }
    }
    this.init();
}


function createClass(binding, validObj) {
    var r = new _output(binding, validObj, function (binding, bValid) {
        var $ele = avalon(binding.element);
        //检查之前会reset到初始化状态，就是没有error 或者 success的状态。所以这里只管加就可以勒
        if ( (this.forError && bValid) || this.forSuccess && !bValid) {
            $ele.toggle(binding.clz,true);
        }
        
        
    });

}