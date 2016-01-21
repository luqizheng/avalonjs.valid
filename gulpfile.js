"use strict";

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    gutil = require("gulp-util"),
    rename = require("gulp-rename"),
    saveLicense = require("uglify-save-license"),
    tsc = require("gulp-typescript"),
    webpack = require("webpack"),
    gfi = require("gulp-file-insert"),
    jshint=require("gulp-jshint");
    
var version = "1.0" //当前版本号
var now = new Date();  //构建日期
var date = now.getFullYear() + "." + (now.getMonth() + 1) + "." + now.getDate()
var jsHintOpt = {
    node: true,
    browser: true,
    esnext: true,
    bitwise: true,
    curly: true,
    eqeqeq: true,
    immed: true,
    indent: 4,
    latedef: true,
    newcap: true,
    noarg: true,
    quotmark: 'single',
    regexp: true,
    undef: true,
    unused: true,
    trailing: true,
    smarttabs: true,
    strict: true
};
var gulpInsert = {
    "/* summary */": "./src/0.summary.js",
    "/* validation */": "./src/validation.js",
    "/* const */": "./src/const.js",    
    "/* group */": "./src/group.js",
    "/* init */": "./src/init.js",
    "/* validators */": "./src/validators.js"    
};

function creategulp(bUglify){
   var d=gulp.src("./src/avalon.valid.js")
        .pipe(concat("avalon.valid.js"))
        .pipe(gfi(gulpInsert))       
        
        //.pipe(jshint(jsHintOpt))
        //.pipe(jshint.reporter('jshint-stylish'))
        //.pipe(jshint.reporter('fail'));
        if(bUglify)
        {
            d.pipe(rename({
                suffix: '-' + version + '.min'
            }))
            d=d.pipe(uglify({output:{comments:saveLicense }}))
        }
        else{
             d.pipe(rename({
                suffix: '-' + version
            }))
        }
        d.pipe(gulp.dest('dist'));
        return d;
}

gulp.task('default',["clean:js"],function(){
    gulp.run(['avalon','avalon:min']);    
});

gulp.task("clean:js", function (cb) {
    rimraf("dist", cb);
});

gulp.task("avalon:min", function (cb) {
    //avalon    
    /*return gulp.src("./src/avalon.valid.js")
        .pipe(concat("avalon.valid.js"))
        .pipe(gfi(gulpInsert))
        .pipe(rename({
            suffix: '-' + version + '.min'
        }))
        .pipe(uglify({output:{comments:saveLicense }}))
        .pipe(gulp.dest('dist'));*/
        return creategulp(true);
})
gulp.task("avalon", function (cb) {
    return creategulp(false);
})

gulp.task('watch', function () {
    gulp.watch(["./src/**", "./example/"], ['default']);
});