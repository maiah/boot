var koa = require('koa');
var app = koa();
var views = require('co-views');
var serve = require('koa-static');
var parse = require('co-body');
var session = require('koa-session');

// Mock users db.
var users = {
    'gohan' : 'joshua',
    'maiah' : 'john'
};

/**
 * Utils.
 */
function genToken() {
    return new Date().toString();
}

function authenticate(user) {
    if (user && user.token) {
        return true;
    } else {
        return false;
    }
}

var render = views(__dirname + '/views', {
  map: { 'html' : 'swig' }
});

/**
 * Middleware setup.
 */
app.use(serve(__dirname + '/public'));

app.keys = ['somesecretmouseandelephant'];
app.use(session());

/**
 * Routes.
 */
app.use(function* (next) {
    if (this.method === 'GET' && this.path === '/login') {
        if (this.session.user) {
            this.redirect('/home');
        } else {
            this.body = yield render('login', { 'msg' : this.session.msg });
        }
    }

    yield* next;
});

app.use(function* (next) {
    if (this.method === 'POST' && this.path === '/login') {
        var login = yield parse(this);

        if (users[login.username] && users[login.username] === login.password) {
            delete this.session.msg;

            // Initialize session user and his/her token.
            this.session.user = {
                'username' : login.username,
                'token' : genToken()
            }

            this.redirect('/home');

        } else {
            this.session.msg = 'Error username or password';
            this.redirect('/login');
        }
    }

    yield* next;
});

app.use(function* (next) {
    if (this.path === '/logout') {
        // Clear the session.
        delete this.session.user;
        this.redirect('/login');
    }

    yield* next;
});

app.use(function* (next) {
    if (this.path === '/home') {
        if (authenticate(this.session.user)) {
            this.type = 'text/html';
            this.body = 'hello ' + this.session.user.username + '. you may <a href="/logout">logout</a>.';

        } else {
            this.redirect('/login');
        }
    }

    yield* next;
});

/**
 * API definitions.
 */
app.use(function* (next) {
    if (this.path === '/api/sample1') {
        this.body = {
            'name' : 'sample1',
            'type' : 'unsecured'
        };
    }

    yield* next;
});

app.use(function* (next) {
    if (this.path === '/api/sample2') {
        if (authenticate(this.session.user)) {
            this.body = {
                'name' : 'sample2',
                'type' : 'secured'
            };

        } else {
            this.status = 401;

            this.body = {
                'statusCode' : 401,
                'status' : 'unauthorized'
            };
        }
    }

    yield* next;
});

app.listen(7000);

console.log('Listening on port 7000');
