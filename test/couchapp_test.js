var grunt = require('grunt');
var COUCH_DB = 'http://localhost:5984';
var DEMO_COUCH_DB = 'grunt-couchapp-demo';
var config;
try{
    config  = require('../config.json');

} catch (e) {
    console.log('to test cookie auth, you need a config.json file');
}


/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.couchapp = {
  setUp: function(done) {
    done();
  }
};

exports.test_db_exists = function(test){
    var dbh = require('nano')(COUCH_DB)
    dbh.db.list(function(err, body) {
        if (!err) {
            // body is an array
            test.notEqual(body.indexOf(DEMO_COUCH_DB),-1,'could not find '+DEMO_COUCH_DB)
        }
        return test.done(err);
    });
    return null;
};

exports.test_db_contains = function(test){
    var dbh = require('nano')([COUCH_DB,DEMO_COUCH_DB].join('/'))
    dbh.list(function(err, body) {
        if (!err) {
            test.equal(body.total_rows,
                       1,
                       'something else is in the test database')
            test.equal(body.rows[0].id,
                       '_design/app',
                       'could not find _design/app in '+DEMO_COUCH_DB)
        }
        return test.done(err);
    });
    return null;
};

exports.test_db_attachments = function(test){
    var dbh = require('nano')([COUCH_DB,DEMO_COUCH_DB].join('/'));
    dbh.get('_design/app',function(err, doc) {
        if (!err) {
            test.equal(doc._id,
                       '_design/app',
                       'fundamental breakage here, did not get what was requested!');
            test.ok(doc._attachments,
                    'do not have the attachments in the design doc');
            test.equal(Object.keys(doc._attachments).length,
                       1,
                       'something else snuck into the attachments');
            test.ok(doc._attachments['index.html'],
                    'do not have index.html attachment');
        }
        return test.done(err);
    });
    return null;
};

exports.test_db_verify_attachment = function(test){
    var dbh = require('nano')([COUCH_DB,DEMO_COUCH_DB].join('/'));
    var fs = require('fs');
    var crypto = require('crypto');
    dbh.attachment.get('_design/app','index.html',function(err,body){
        if (!err) {
            var shasum1 = crypto.createHash('sha1');
            var shasum2 = crypto.createHash('sha1');
            shasum2.update(body);
            var d2 = shasum2.digest('hex');

            var s = fs.createReadStream('./demo/attachments/index.html');
            s.on('data', function(d) {
                shasum1.update(d);
            });
            s.on('end', function() {
                var d1 = shasum1.digest('hex');
                test.equal(d1,d2
                          ,'file index.html does not equal db version of index.html');
                return test.done();
            });
            s.on('error',function(err){
                console.log(err)
                return test.done(err)
            })
        }else{
            return test.done(err);
        }
        return null;
    })
};
