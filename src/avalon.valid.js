!function (factory) { //http://chen.junchang.blog.163.com/blog/static/6344519201312514327466/

    //factory是一个函数，下面的koExports就是他的参数

    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // [1] CommonJS/Node.js
        // [1] 支持在module.exports.abc,或者直接exports.abc
        //var target = module['exports'] || exports; // module.exports is for Node.js
        //var avalon = require("avalon");
        //factory(avalon);
        define(function(){
            factory(require("avalon"));
        })
    } else if (typeof define === 'function' && define['amd']) {
        // [2] AMD anonymous module
        // [2] AMD 规范 
        //define(['exports'],function(exports){
        //    exports.abc = function(){}
        //});
        define(['avalon'], factory);
    } else {
        // [3] No module loader (plain <script> tag) - put directly in global namespace
        factory(window['avalon']);
    }
} (function (avalon) {
    
    /* const */
    /* init */
    /* ValidObj */
    /* validatorFactory */
    /* Validator */
    /* validDefined */
    
    /* validators */

    
});

