module.exports = function(grunt) {
  "use strict";
  
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    BRAINBROWSER_VERSION: "<%= pkg.version %>",
    dev_js: "public/development/js",
    prod_js: "public/production/js",
    build_dir: "build/brainbrowser-<%= BRAINBROWSER_VERSION %>",
    license: grunt.file.read("license_header.txt"),
    concat: {
      options: {
        separator: ";",
        process: true
      },
      surface: {
        src: [
          "<%= dev_js %>/brainbrowser/lib/*.js",
          "<%= dev_js %>/brainbrowser/surface-viewer.js",
          "<%= dev_js %>/brainbrowser/surface-viewer/**/*.js"
        ],
        dest: "tmp/brainbrowser.surface-viewer.js"
      },
      macacc: {
        src: [
          "<%= dev_js %>/macacc/macacc.js",
          "<%= dev_js %>/macacc-viewer.js"
        ],
        dest: "tmp/macacc-viewer-combined.js"
      },
      volume: {
        src: [
          "<%= dev_js %>/brainbrowser/lib/*.js",
          "<%= dev_js %>/brainbrowser/volume-viewer.js",
          "<%= dev_js %>/brainbrowser/volume-viewer/**/*.js"
        ],
        dest: "tmp/brainbrowser.volume-viewer.js"
      },
      libs : {
        files: {
          "tmp/brainbrowser.utils.js": "<%= dev_js %>/brainbrowser/lib/utils.js"
        }
      },
    },
    uglify: {
      options: {
        report: "min",
        banner: "<%= license %>\n" +
                "/*\n" +
                "* <%= pkg.name %> v<%= pkg.version %>\n" +
                "* https://brainbrowser.cbrain.mcgill.ca/\n" +
                "*\n" +
                "* Author: Tarek Sherif  <tsherif@gmail.com> (http://tareksherif.ca/)\n" +
                "* Author: Nicolas Kassis\n" +
                "*/\n"
      },
      surface: {
        files: {
          "<%= build_dir %>/brainbrowser.surface-viewer.min.js": "<%= concat.surface.dest %>"
        }
      },
      surface_ui: {
        files: {
          "<%= prod_js %>/brainbrowser.surface-viewer.ui.min.js": "<%= dev_js %>/ui/brainbrowser.surface-viewer.ui.js"
        }
      },
      volume: {
        files: {
          "<%= build_dir %>/brainbrowser.volume-viewer.min.js": "<%= concat.volume.dest %>"
        }
      },
      volume_ui: {
        files: {
          "<%= build_dir %>/brainbrowser.volume-viewer.ui-controls.min.js": "<%= dev_js %>/ui/brainbrowser.volume-viewer.ui-controls.js"
        }
      },
      demos: {
        files: {
          "<%= prod_js %>/surface-viewer-demo.js": "<%= dev_js %>/surface-viewer-demo.js",
          "<%= prod_js %>/macacc-viewer-combined.min.js": "<%= concat.macacc.dest %>",
          "<%= prod_js %>/volume-viewer-demo.js": "<%= dev_js %>/volume-viewer-demo.js",
          "<%= prod_js %>/fmri-viewer.js": "<%= dev_js %>/fmri-viewer.js"
        }
      },
      libs : {
        files: {
          "<%= prod_js %>/index.js": "<%= dev_js %>/index.js",
          "<%= prod_js %>/ui/common.js": "<%= dev_js %>/ui/common.js",
          "<%= prod_js %>/lib/brainbrowser.utils.js": "tmp/brainbrowser.utils.js"
        }
      },
      workers: {
        files: {
          "<%= build_dir %>/workers/mniobj.worker.js": "<%= dev_js %>/brainbrowser/workers/mniobj.worker.js",
          "<%= build_dir %>/workers/wavefront_obj.worker.js": "<%= dev_js %>/brainbrowser/workers/wavefront_obj.worker.js",
          "<%= build_dir %>/workers/freesurfer_asc.worker.js": "<%= dev_js %>/brainbrowser/workers/freesurfer_asc.worker.js",
          "<%= build_dir %>/workers/data.worker.js": "<%= dev_js %>/brainbrowser/workers/data.worker.js",
          "<%= build_dir %>/workers/deindex.worker.js": "<%= dev_js %>/brainbrowser/workers/deindex.worker.js"
        }
      }
    },
    jshint: {
      options: {
        eqeqeq: true,
        undef: true,
        unused: true,
        strict: true,
        indent: 2,
        immed: true,
        latedef: true,
        newcap: true,
        nonew: true,
        trailing: true
      },
      grunt: {
        src: "Gruntfile.js",
        options: {
          node: true
        }
      },
      server: {
        src: ["brainbrowser.js", "lib/minc-server.js", "routes/routes.js"],
        options: {
          node: true
        }
      },
      brainbrowser: {
        options: {
          browser: true,
          jquery: true,
          globals: {
            THREE: true,
            BrainBrowser: true,
            MACACC: true,
            utils: true,
            alert: true,
            console: true
          }
        },
        src: [
          "<%= dev_js %>/index.js",
          "<%= dev_js %>/lib/ui.js",
          "<%= concat.surface.src %>",
          "<%= dev_js %>/surface-viewer.js",
          "<%= dev_js %>/macacc/macacc.js",
          "<%= dev_js %>/macacc-viewer.js",
          "<%= concat.volume.src %>",
          "<%= dev_js %>/fmri-viewer.js"
        ]
      },
      workers: {
        options: {
          worker: true,
          globals: {
            Float32Array: true
          }
        },
        src: ["<%= dev_js %>/brainbrowser/workers/*.js"]
      },
      loris: {
        options: {
          browser: true,
          jquery: true,
          globals: {
            BrainCanvas: true,
          }
        },
        src: ["public/development/loris/js/braincanvas.loris_ui_controls.js"]
      }
    },
    clean: {
      build :[
        "<%= prod_js %>/brainbrowser",
        "build/brainbrowser-*"
      ],
      tmp: "tmp/*.js",
      docs: ["docs/docular/.htaccess", "docs/docular/favicon.ico", "docs/docular/configs", "docs/docular/controller", "docs/docular/php"]
    },
    symlink: {
      explicit: {
        files: {
          "<%= prod_js %>/brainbrowser": "<%= build_dir %>"
        }
      }
    },
    watch: {
      grunt: {
        files: ["<%= jshint.grunt.src %>"],
        tasks: ["jshint:grunt"]
      },
      brainbrowser: {
        files: ["<%= jshint.brainbrowser.src %>"],
        tasks: ["jshint:brainbrowser"]
      },
      workers: {
        files: ["<%= jshint.workers.src %>"],
        tasks: ["jshint:workers"]
      },
      loris: {
        files: ["<%= jshint.loris.src %>"],
        tasks: ["jshint:loris"]
      }
    },
    docular: {
      docular_webapp_target: "docs/docular",
      docular_partial_home: "docs/docular_brainbrowser_home.html",
      groups: [
        {
          groupTitle: "BrainBrowser v<%= pkg.version %>",
          groupId: "brainbrowser",
          showSource: false,
          sections: [
            {
              title: "Utilities",
              id: "utils",
              scripts: ["<%= dev_js %>/brainbrowser/lib"]
            },
            {
              title: "Surface Viewer",
              id: "surface-viewer",
              scripts: ["<%= dev_js %>/brainbrowser/surface-viewer.js", "<%= dev_js %>/brainbrowser/surface-viewer"]
            },
            {
              title: "Volume Viewer",
              id: "volume-viewer",
              scripts: ["<%= dev_js %>/brainbrowser/volume-viewer.js", "<%= dev_js %>/brainbrowser/volume-viewer"]
            }
          ]
        }
      ]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-symlink");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-docular");

  grunt.registerTask("compile", ["clean", "concat", "uglify", "symlink"]);
  grunt.registerTask("build", ["jshint", "compile", "docs"]);
  grunt.registerTask("docs", ["docular", "clean:docs"]);
  grunt.registerTask("default", "jshint");
};
