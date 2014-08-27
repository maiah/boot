var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    session = require('express-session');

// Mock users db.
var users = {
    'gohan' : 'joshua',
    'maiah' : 'john'
};

// Config.
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Middleware setup.
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ 'extended' : false }));
app.use(session({
    'resave' : false,
    'saveUninitialized' : false,
    'secret' : 'somesecretmouseandelephant'
}));
app.use(function (req, res, next) {
    res.locals.errorMsg = '';
    next();
});

function genToken() {
    return new Date().toString();
}

function authenticate(req, res, fn) {
    if (req.session.token) {
        fn();
    } else {
        res.redirect('/login');
    }
}

app.route('/login')
    .get(function (req, res) {
        if (req.session.token) {
            res.redirect('/home');
        } else {
            res.render('login');
        }
    })
    .post(function (req, res) {
        var username = req.body.username

        if (users[username] && users[username] === req.body.password) {
            req.session.token = genToken();
            res.redirect('/home');

        } else {
            delete req.session.token;

            res.locals.errorMsg = 'Wrong username or password!';
            res.render('login');
        }
    });

app.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/login');
    });
});

// Secure page.
app.get('/home', function (req, res) {
    authenticate(req, res, function () {
        res.send('This is a secure page.<br><a href="/logout">logout</a>');
    });
});

app.listen(7000);

console.log('Listening on port 7000');
