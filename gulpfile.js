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
    gfi = require("gulp-file-insert"),
    jshint = require("gulp-jshint");

var version = "1.0" //当前版本号
var now = new Date();  //构建日期
var date = now.getFullYear() + "." + (now.getMonth() + 1) + "." + now.getDate()
var jsHintOpt = {
    node: false,
    browser: true,
    esnext: false,
    bitwise: false,
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
    "/* Validator */": "./src/Validator.js",
    "/* ValidObj */": "./src/ValidObj.js",
    "/* const */": "./src/const.js",
    "/* init */": "./src/init.js",
    "/* validatorFactory */": "./src/validatorFactory.js",    
    "/* validators */": "./src/validators.js",
    "/* validDefined */":"./src/avalon.valid.defined.js"
};

function creategulp(bUglify) {
    var d = gulp.src("./src/avalon.valid.js")
        .pipe(concat("avalon.valid.js"))
        .pipe(gfi(gulpInsert))

    if (bUglify) {
        d.pipe(rename({
            suffix: '-' + version + '.min'
        }))
        d = d.pipe(uglify({ output: { comments: saveLicense } }))
    }
    else {
        d.pipe(rename({
            suffix: '-' + version
        }))
    }
    d.pipe(gulp.dest('dist'));
    return d;
}

gulp.task('default', ['avalon', 'avalon:min'], function () {
    gulp.src("./dist/*.*")
        .pipe(gulp.dest("./example/site/wwwroot/dist"));
        
        gulp.src("./dist/*.*")
        .pipe(gulp.dest("./demo/dist"));
});

gulp.task('check', function () {
    return gulp.src("./dist/*.js").pipe(jshint(jsHintOpt))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
})

gulp.task("clean:js", ["clean:example"], function (cb) {
    rimraf("dist", cb);

});
gulp.task("clean:example", ["clean:js"], function (cb) {
    rimraf("./demo/dist", cb);
})

gulp.task("avalon:min", function (cb) {
    return creategulp(true);
})
gulp.task("avalon", function (cb) {
    return creategulp(false);
})

gulp.task('watch', function () {
    gulp.watch(["./src/**", "./demo/**"], ['default']);
});