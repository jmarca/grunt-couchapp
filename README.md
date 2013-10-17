# grunt-couchapp

A grunt plugin for building and installing couchapps

## Getting Started

Install this grunt plugin next to your project's
[grunt.js gruntfile][getting_started] with: `npm install
grunt-couchapp`

Then add this line to your project's `grunt.js` gruntfile:

    grunt.loadNpmTasks('grunt-couchapp');

[grunt]: https://gruntjs.com
[getting_started]: http://gruntjs.com/getting-started

## Documentation

You'll want to add some configuration for the plug-in.  This plugin
provides three tasks, `mkcouchdb` to create new databases, `rmcouchdb`
to delete all data and drop an existing database, and `couchapp`,
which installs a specified couchapp into the database.

    mkcouchdb: {
        demo: {
            db: 'http://localhost:5984/grunt-couchapp-demo',
            options: {
                okay_if_exists: true
            }
        }
    },

    rmcouchdb: {
        demo: {
            db: 'http://localhost:5984/grunt-couchapp-demo',
            options: {
                okay_if_missing: true
            }
        }
    },

    couchapp: {
        demo: {
            db: 'http://localhost:5984/grunt-couchapp-demo',
            app: './demo/app.js'
        }
    }

As a stylistic note, all of the commands take the same info, so it's
possible to write in your configuration file:

    couch_config = {
        demo: {
            db: 'http://localhost:5984/grunt-couchapp-demo',
            app: './demo/app.js',
            options: {
                okay_if_missing: true,
                okay_if_exists: true
            }
        }
    }

    grunt.initConfig({
        ...
        mkcouchdb: couch_config,
        rmcouchdb: couch_config,
        couchapp: couch_config,
        ...
    });


Note that if you call `rmcouchdb` without a sub-argument, it will not delete any databases.

### Auth

If your CouchDB is not in admin party mode, you will probably need to
deal with authentication.  One way is to use a URL with an embedded
username and password.  For example:


    couch_config = {
        demo: {
            db: 'http://sharon:isARobot@localhost:5984/grunt-couchapp-demo',
            app: './demo/app.js',
            options: {
                okay_if_missing: true,
                okay_if_exists: true
            }
        }
    }

However, CouchDB is moving away from supporting basic auth and
recommends using cookie based authentication (as noted in
[this comment](https://github.com/elfsternberg/grunt-couchapp/pull/3#issuecomment-12851308)).


To use cookie based authentication, you can use the following
configuration format:


    couch_config = {
        demo: {
            db: 'http://127.0.0.1:5984/grunt-couchapp-demo',
            app: './demo/app.js',
            auth: {username:"sharon",
                   password:"I am a Cylon ha ha suckers!"
                  },
            options: {
                okay_if_missing: true,
                okay_if_exists: true
            }
        }
    }

The only caveat at the moment is that node.couchapp.js, upon which
this module depends to actually push the couchapp to CouchDB, does not
yet support cookie-based authentication.  At the moment, the username and
password set in the configuration are used to update the URL to a
traditional basic auth scheme.

## Demo

It is possible to run the entire toolchain (drop, initialize, and
install) with the grunt.js file by calling `grunt demo`.  As long as
you have a local couchdb running in admin-party mode, and browse to
`http://localhost:5984/grunt-couchapp-demo/_design/app/index.html`
You should get back a happy message.

If you are *not* running in admin-party mode, modify the file
`grunt.js` to include your username and password, as noted above.

## Security

Leaving your username and password in a file for anyone to see is not
wise.  If you do this, you should make sure that the config file is
not in your repository (add it to .gitignore) and that it is only
visible to the current user (in UNIX, chmod 0600 config.json)

A suggestion is to set up a file called `couchapp.json`

``` javascript
{
  "couchapp": {
    "root": "http://127.0.0.1:5984",
    "db": "enterprise",
    "app": "app.js",
    "auth":{"username":"jtkirk",
            "password":"correct horse battery staple"
            }
  }
}
```
Exclude that from github by adding it to .gitignore, then including it
in your `Gruntfile.js` like so:

At the top of the `Gruntfile.js`, before the line `module.exports =
...`, add

```
var config = require('./couchapp.json');
```

Then, lower down in the `Gruntfile.js`, in the `grunt.initConfig({`
section, add the configuration parameters for this package:

``` javascript
mkcouchdb: {
    app: {
        db: [config.couchapp.root, config.couchapp.db].join('/'),
        auth: config.couchapp.auth,
        options: {
            okay_if_exists: true
        }
    }
},
couchapp: {
    app: {
        db: [config.couchapp.root, config.couchapp.db].join('/'),
        auth: config.couchapp.auth,
        app: config.couchapp.app
    }
}

```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing
coding style. Add unit tests for any new or changed
functionality. Lint and test your code using [grunt][grunt].

## License
Copyright (c) 2012 Ken Elf Mathieu Sternberg
Licensed under the MIT license.
