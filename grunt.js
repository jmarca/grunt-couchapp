var DEMO_COUCH_DB = 'http://localhost:5984/grunt-couchapp-demo';
var config;
try{
    config  = require('./config.json');

} catch (e) {
    console.log('to test cookie auth, you need a config.json file');
}

var couchapp_config = {
    test: {
        files: ['test/**/*.js']
    },
    lint: {
        files: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
    },
    watch: {
        files: '<config:lint.files>',
        tasks: 'default'
    },
    jshint: {
        options: {
            curly: true,
            eqeqeq: true,
            immed: true,
            latedef: true,
            newcap: true,
            noarg: true,
            sub: true,
            undef: true,
            boss: true,
            eqnull: true,
            node: true,
            es5: true
        },
        globals: {}
    },
    mkcouchdb: {
        demo: {
            db: DEMO_COUCH_DB
        }
    },
    rmcouchdb: {
        demo: {
            db: DEMO_COUCH_DB,
            options: {
                okay_if_missing: true
            }
        }
    },
    couchapp: {
        demo: {
            db: DEMO_COUCH_DB,
            app: './demo/app.js'
        }
    }
};

if(config !== undefined){
    couchapp_config.mkcouchdb= {
        demo: {
            db: DEMO_COUCH_DB,
            auth: config.demo.auth
        }
    };
    couchapp_config.rmcouchdb= {
        demo: {
            db: DEMO_COUCH_DB,
            auth: config.demo.auth,
            options: {
                okay_if_missing: true
            }
        }
    };
    couchapp_config.couchapp= {
        demo: {
            db: DEMO_COUCH_DB,
            auth: config.demo.auth,
            app: './demo/app.js'
        }
    };
}

module.exports = function(grunt) {
    // Project configuration.

    grunt.initConfig(couchapp_config);

    // Load local tasks.
    grunt.loadTasks('tasks');

    // Default task.
    grunt.registerTask('default', 'lint');
    grunt.registerTask('demo', 'rmcouchdb:demo mkcouchdb:demo couchapp:demo test rmcouchdb:demo');

};
