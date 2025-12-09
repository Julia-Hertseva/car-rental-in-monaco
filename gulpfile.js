const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const fs = require("fs");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const replace = require("gulp-replace");
const browserSync = require("browser-sync").create();

function clean(cb) {
  if (fs.existsSync("dist")) {
    fs.rmSync("dist", { recursive: true, force: true });
  }
  console.log("✅ Папка dist очищена");
  cb();
}

function styles() {
  console.log("🔧 Компиляция SCSS...");

  return (
    gulp
      .src("src/styles/main.scss")
      .pipe(
        sass({
          includePaths: ["src/styles"],
          outputStyle: "expanded",
        }).on("error", sass.logError)
      )
      .pipe(autoprefixer())
      .pipe(
        cleanCSS({
          level: 2,
        })
      )
      // ИСПРАВЛЯЕМ ВСЕ ПУТИ
      .pipe(replace(/url\((['"])?\.\.\/images\//g, "url($1../images/"))
      .pipe(replace(/url\((['"])?\.\.\/fonts\//g, "url($1../fonts/"))
      .pipe(replace(/url\((['"])?images\//g, "url($1../images/"))
      .pipe(replace(/url\((['"])?fonts\//g, "url($1../fonts/"))
      .pipe(gulp.dest("dist/styles"))
      .pipe(browserSync.stream()) // Автоматическое обновление CSS
      .on("end", () => console.log("✅ SCSS скомпилирован"))
  );
}

function copyAll() {
  console.log("📁 Копирование файлов...");
  return gulp
    .src(["src/**/*", "!src/styles/**/*.scss", "!src/styles/main.scss"])
    .pipe(gulp.dest("dist"))
    .on("end", () => console.log("✅ Файлы скопированы"));
}

function fixHtmlPaths() {
  console.log("🔗 Исправление путей в HTML...");

  return (
    gulp
      .src("dist/*.html")
      // Исправляем пути в HTML
      .pipe(replace(/href="\.\//g, 'href="'))
      .pipe(replace(/src="\.\//g, 'src="'))
      .pipe(replace(/href="css\//g, 'href="./css/'))
      .pipe(replace(/href="fontawesome\//g, 'href="./fontawesome/'))
      .pipe(replace(/href="styles\//g, 'href="./styles/'))
      .pipe(replace(/src="images\//g, 'src="./images/'))
      .pipe(replace(/src="scripts\//g, 'src="./scripts/'))
      .pipe(gulp.dest("dist"))
      .on("end", () => console.log("✅ Пути в HTML исправлены"))
  );
}

// Задача для сборки
const build = gulp.series(clean, gulp.parallel(copyAll, styles), fixHtmlPaths);

// Сервер для разработки
function serve() {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
    port: 3000,
    open: true, // Автоматически открыть браузер
    notify: false,
  });

  // Следим за изменениями в src и пересобираем
  gulp.watch("src/styles/**/*.scss", styles);
  gulp.watch(
    ["src/**/*", "!src/styles/**/*.scss"],
    gulp.series(copyAll, fixHtmlPaths, reload)
  );
}

// Перезагрузка браузера
function reload(done) {
  browserSync.reload();
  done();
}

// Экспорт задач
exports.build = build;
exports.serve = gulp.series(build, serve);
exports.dev = exports.serve; // Алиас для dev
exports.styles = styles;
exports.clean = clean;
exports.default = exports.serve; // Теперь gulp запускает сервер
