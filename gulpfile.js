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
    gfi = require("gulp-file-insert");;
var version = "1.0" //当前版本号
var now = new Date();  //构建日期
var date = now.getFullYear() + "." + (now.getMonth() + 1) + "." + now.getDate()

var gulpInsert = {
    "/* summary */": "./src/0.summary.js",
    "/* validation */": "./src/validation.js",
    "/* const */": "./src/const.js",    
    "/* group */": "./src/group.js",
    "/* init */": "./src/init.js",
    "/* validators */": "./src/validators.js"    
};


gulp.task('default',["clean:js"],function(){
    gulp.run(['avalon:min','avalon']);
    console.log("------------------end=-----------------------------")
});

gulp.task("clean:js", function (cb) {
    rimraf("dist", cb);
});

gulp.task("avalon:min", function (cb) {
    //avalon    
    return gulp.src("./src/avalon.valid.js")
        .pipe(concat("avalon.valid.js"))
        .pipe(gfi(gulpInsert))
        .pipe(rename({
            suffix: '-' + version + '.min'
        }))
        .pipe(uglify({output:{comments:saveLicense }}))
        .pipe(gulp.dest('dist'));
})


gulp.task("avalon", function (cb) {
    //avalon
     return gulp.src("./src/avalon.valid.js")
        .pipe(concat("avalon.valid.js"))
        .pipe(gfi(gulpInsert))
        .pipe(rename({
            suffix: '-' + version
        }))
        .pipe(gulp.dest('dist'));
})

gulp.task('watch', function () {
    gulp.watch(["./src/**", "./example/"], ['default']);
});