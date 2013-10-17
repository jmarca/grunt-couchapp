/*
 * grunt-couchapp https://github.com/elf/grunt-couchapp
 *
 * Copyright (c) 2012 Ken "Elf" Mathieu Sternberg
 * Licensed under the MIT license.
 */

var path, couchapp, nanolib, urls;

path = require('path');
couchapp = require('couchapp');
urls = require('url');

var genDB = function(db) {
  var parts, dbname, auth;
  parts = urls.parse(db);
  dbname = parts.pathname.replace(/^\//, '');
  auth = parts.auth ? (parts.auth + '@') : '';
  return {
    name: dbname,
    url: parts.protocol + '//' + auth + parts.host
  };
};

module.exports = function(grunt) {

  // ==========================================================================
  // TASKS
  // ==========================================================================

    grunt.registerMultiTask("couchapp", "Install Couchapp", function() {
        var appobj, done, parts, url_with_auth;
        done = this.async();

        appobj = require(path.join(process.cwd(), path.normalize(this.data.app)));

        // couchapp is lame and only supports basic auth
        // can patch that too, but instead just fix up the url for now
        // TEMPORARY HACK

        url_with_auth = this.data.db; // default is no auth needed case
        if(this.data.auth !== undefined &&
           this.data.auth.username !== undefined &&
           this.data.auth.password !== undefined){
            // fix up a basic auth url
            parts = urls.parse(this.data.db);
            parts.auth = [this.data.auth.username,this.data.auth.password].join(':');
            url_with_auth = urls.format(parts);
        }
        return couchapp.createApp(appobj, url_with_auth, function(app) {
            return app.push(done);
        });
    });

    grunt.registerMultiTask("rmcouchdb", "Delete a Couch Database", function() {
        var done, parts, nano, dbname, _this, db, authcookie, username, password;
        _this = this;
        done = this.async();
        db = genDB(this.data.db);
        if(this.data.auth !== undefined){
            username = this.data.auth.username;
            password = this.data.auth.password;
        }
        function destroy_callback(err,res) {
            if (err) {
                if (err.status_code && err.status_code === 404) {
                    if (_this.data.options && _this.data.options.okay_if_missing) {
                        grunt.log.writeln("Database " + db.name + " not present... skipping.");
                        return done(null, null) ;
                    } else {
                        grunt.warn("Database " + db.name + " does not exist.");
                    }
                } else {
                    // add more info, or else failure in auth  (non-admin-party) mode is opaque
                    var message = JSON.stringify(err);
                    if(err.message !== undefined){
                        message = err.message;
                    }
                    grunt.warn("Database " + db.name + " does not exist.  Error message: " + message);
                }
            }
            return done(err, null);
        }
        try {
            if (db.name) {
                nano = require('nano')(db.url);
                if(this.data.auth !== undefined){
                    nano.auth(username, password, function (err, body, headers) {
                        if (err) {
                            grunt.warn('error: '+err);
                            return done(err);
                        }
                        if (headers && headers['set-cookie']) {
                            authcookie = headers['set-cookie'];
                            //grunt.log.writeln("cookies: "+JSON.stringify(authcookie))
                        }
                        nano = require('nano')({url : db.url,
                                               cookie: authcookie
                                               }
                                              );

                        nano.db.destroy(db.name, destroy_callback);
                        return null;
                    });
                } else { // do not use auth
                    nano = require('nano')({url : db.url});
                    nano.db.destroy(db.name, destroy_callback);
                }

            } else {
                grunt.log.writeln("No database specified... skipping.");
                return done(null, null);
            }
        } catch (e) {
            grunt.warn(e);
            done(e, null);
        }
        return null;
    });

    grunt.registerMultiTask("mkcouchdb", "Make a Couch Database", function() {
        var done, parts, nano, dbname, _this, db, authcookie, username, password;
        _this = this;

        done = this.async();
        parts = urls.parse(this.data.db);
        db = genDB(this.data.db);
        if(this.data.auth !== undefined){
            username = this.data.auth.username;
            password = this.data.auth.password;
        }
        function create_callback(err,res){
            if (err) {
                if (_this.data.options && _this.data.options.okay_if_exists) {
                    grunt.log.writeln("Database " + db.name + " exists, skipping");
                    return done(null, null);
                } else {
                    // add more info, or else failure in auth  (non-admin-party) mode is opaque
                    var message = JSON.stringify(err);
                    if(err.message !== undefined){
                        message = err.message;
                    }
                    grunt.warn("Database " + db.name + " exists, aborting.  Error message: " + message);
                    return done(err, null);
                }
            } else {
                grunt.log.writeln("Database " + db.name + " created.");
                return done(null, null);
            }
        }

        try {
            if (db.name) {
                if(this.data.auth !== undefined){
                    nano = require('nano')(db.url);
                    nano.auth(username, password, function (err, body, headers) {
                        if (err) {
                            grunt.warn('error: '+err);
                            return done(err);
                        }
                        if (headers && headers['set-cookie']) {
                            authcookie = headers['set-cookie'];
                            // grunt.log.writeln("cookies: "+JSON.stringify(authcookie))
                        }
                        nano = require('nano')({url : db.url,
                                               cookie: authcookie
                                               }
                                              );

                        nano.db.create(db.name, create_callback);
                        return null;
                    });
                } else { // do not use auth
                    nano = require('nano')({url : db.url});
                    nano.db.create(db.name, create_callback);
                }

            } else {
                var err_msg = "No database specified to create!";
                grunt.warn(err_msg);
                return done(new Error(err_msg), null);
            }
        } catch (e) {
            grunt.warn(e);
            done(e, null);
        }
        return null;
    });

};
