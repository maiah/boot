require('setimmediate');

var co = require('co');
var thunkify = require('thunkify');
var request = require('request');
var get = thunkify(request.get);

/**
 * Unsecured api.
 */
co(function* () {
    var res = yield get('http://localhost:7000/api/sample1');
    console.log('Status is ', res[0].statusCode);
    console.log('Content is\n', res[1]);
})();


/**
 * Secured api.
 */
co(function* () {
    var res = yield get('http://localhost:7000/api/sample2');
    console.log('Status is ', res[0].statusCode);
    console.log('Content is\n', res[1]);
})();
