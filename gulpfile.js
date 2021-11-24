// Initialize Modules(

const { src, dest, watch, parallel, series } = require("gulp");
const fileinclude = require("gulp-file-include");
const browsersync = require("browser-sync").create();
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const concat = require("gulp-concat");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const uglify = require("gulp-uglify");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");

// Variables
const path = {
  src: {
    css: "src/css/**/*.css",
    scss: "src/scss/**/*.scss",
    js: "src/js/**/*.js",
    html: "src/**/*.html",
    img: "src/assets/img/**/*.{jpg,png,svg,gif,ico,webp,bmp,tiff}",
    fonts: "src/assets/fonts/**/*.{ttf,otf,woff,woff2,svg}",
  },
  dist: {
    css: "dist/css",
    js: "dist/js",
    html: "dist/",
    img: "dist/assets/img",
    fonts: "dist/assets/fonts",
  },
};

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "dist",
    },
    port: 3000,
    notify: false,
  });
}

function processHTML() {
  const cbString = new Date().getTime();
  return src(path.src.html)
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(
      htmlmin({
        cssmin: true,
        jsmin: true,
        removeComments: true,
        removeOptionalTags: true,
        collapseWhitespace: true,
      })
    )
    .pipe(dest(path.dist.html))
    .on("change", browsersync.reload);
}



function processCSS() {
  return src(path.src.css)
    .pipe(dest(path.dist.css))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest(path.dist.css))
    .pipe(browsersync.stream())
    .pipe(notify("Scss compiled!"));
}


function processSCSS() {
  return src(path.src.scss)
    .pipe(plumber())
    .pipe(sass({ errLogToConsole: true }))
    .on("error", catchErr)
    .pipe(sourcemaps.write("."))
    .pipe(dest(path.dist.css))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest(path.dist.css))
    .pipe(browsersync.stream())
    .pipe(notify("Scss compiled!"));
}


function catchErr(e) {
  console.log(e);
  notify("Error Occured");
  this.emit("end");
}

function processJS() {
  return src(path.src.js)
    .pipe(concat("all.js"))
    .pipe(dest(path.dist.js))
    .pipe(uglify())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(dest(path.dist.js))
    .pipe(browsersync.stream());
}

function processFonts() {
  return src(path.src.fonts)
    .pipe(dest(path.dist.fonts))
    .pipe(browsersync.stream());
}

// Images Tasks

function processImages() {
  return src(path.src.img)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false}],
        interlaced: true,
        optimizationLevel: 3    // 0 to 7
      })
    )
    .pipe(dest(path.dist.img))
    .pipe(browsersync.stream());
}

// Watch Task

function watchFiles(params) {
  watch(
    [
      path.src.html,
      path.src.css,
      path.src.scss,
      path.src.js,
      path.src.fonts,
      path.src.img,
    ],
    parallel(
      processHTML,
      processCSS,
      processSCSS, 
      processJS,
      processFonts,
      processImages
    )
  );
}

function defaultTask() {
  
};



exports.html    =  processHTML;
exports.css     =  processCSS;
exports.scss    =  processSCSS;
exports.js      =  processJS;
exports.img     =  processImages;
exports.fonts   =  processFonts;
exports.default = parallel(
  browserSync,
  parallel(
    processHTML,
    processCSS,
    processSCSS,
    processJS,
    processFonts,
    processImages
  ),
  watchFiles
);




