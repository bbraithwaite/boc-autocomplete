module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'lib/*.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'build/<%= pkg.name %>.min.css': ['lib/<%= pkg.name %>.css']
        }
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      beforeconcat: ['lib/**/*.js', 'test/**/*.js'],
      afterconcat: ['build/<%= pkg.name %>.js']
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'jshint', 'cssmin']);

};