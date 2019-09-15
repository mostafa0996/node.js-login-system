const express = require('express');
const expressLayouts = require('express-ejs-layouts'); // to deal with ejs
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

// Passport Configurations
require('./config/passport')(passport);

//Connect to mongo
mongoose
	.connect('mongodb://localhost:27017/nodelogin', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('Connected to Db'))
	.catch(err => console.log(err.message));

// EJS setup
app.use(expressLayouts); // This line should be always at the top
app.set('view engine', 'ejs');

// Body Parser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
	session({
		secret: 'mySecret',
		resave: true,
		saveUninitialized: true,
	}),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/user'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
