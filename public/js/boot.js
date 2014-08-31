require('setimmediate');

var co = require('co');
var thunkify = require('thunkify');
var request = require('request');
var get = thunkify(request.get);

co(function* () {
    var res = yield get('http://localhost:7000/js/boot.js');
    console.log('Status is ', res[0].statusCode);
    console.log('Content is\n', res[1]);
})();
