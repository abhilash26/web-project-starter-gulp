
const browser_port = 3000;

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
const plumber = require('gulp-plumber');
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
    port: browser_port,
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

 function processFonts() {
   return src(path.src.fonts)
     .pipe(dest(path.dist.fonts))
     .pipe(browsersync.stream());
 }

function processCSS() {
  return src(path.src.css)
    .pipe(dest(path.dist.css))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest(path.dist.css))
    .pipe(browsersync.stream());
}

function processSCSS() {
  return src(path.src.scss)
    .pipe(plumber())
    .pipe(sass({ errLogToConsole: true }).on("error", catchErr))
    .pipe(dest(path.dist.css))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest(path.dist.css))
    .pipe(browsersync.stream());
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
    .pipe(dest(path.dist.img));
}

function watchFiles() {
  browserSync();
  watch(path.src.scss, processSCSS);
  watch(path.src.css, processCSS);
  watch(path.src.js, processJS);
  watch(path.src.fonts, processFonts);
  watch(path.src.img, processImages);
  watch(path.src.html, processHTML).on("change", browsersync.reload);
}

exports.default = parallel(
  series(
    processHTML, 
    processCSS, 
    processSCSS,
    processJS,
    processFonts,
    processImages
    ),
    watchFiles
);


exports.watch = watchFiles;