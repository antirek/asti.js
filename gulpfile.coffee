gulp = require 'gulp'
concat = require 'gulp-concat'

gulp.task 'default', ()->
  gulp.src [
    './bower_components/fetch/fetch.js'
    './js/index.js'
    ]
  .pipe concat 'asti.js'
  .pipe gulp.dest './dist'

gulp.task 'watch', ['default'], ()->
  gulp.watch ['js/**'], (event)->  
    gulp.run('default')