const { src, dest, watch, parallel, series } = require("gulp");
const fileinclude = require("gulp-file-include");
const browsersync = require("browser-sync").create();
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

function browserSync() {
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
    .pipe(fileinclude())
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(htmlmin())
    .pipe(dest(path.dist.html));
}

function processCSS() {
  return src(path.src.css)
    .pipe(dest(path.dist.css))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest(path.dist.css));
}

function processSCSS() {
  return src(path.src.scss)
    .pipe(plumber())
    .pipe(sass({ errLogToConsole: true }).on("error", catchErr))
    .pipe(dest(path.dist.css))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest(path.dist.css));
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
    .pipe(dest(path.dist.js));
}

// Images Tasks

function processImages() {
  return src(path.src.img)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3, // 0 to 7
      })
    )
    .pipe(dest(path.src.img));
}
// Watch Task

function watchFiles() {
  parallel(
    watch(path.src.html).on("change", browsersync.reload()),
    watch(path.src.css).on("change", browsersync.stream()),
    watch(path.src.scss).on("change", browsersync.stream()),
    watch(path.src.js).on("change", browsersync.stream()),
    watch(path.src.img).on("change", browsersync.stream())
  );
}

// Default Task

exports.default = series(
  parallel(processHTML, processCSS, processSCSS, processJS, processImages),
  series(browserSync, watchFiles)
);
