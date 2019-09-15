const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => {
	res.render('login');
});

// Regitser Page
router.get('/register', (req, res) => {
	res.render('register');
});

// Register Handle
router.post('/register', async (req, res) => {
	const { name, email, password, password2 } = req.body;
	let errors = [];

	if (!name || !email || !password || !password2) {
		errors.push({ msg: 'Please enter all fields' });
	}

	if (password != password2) {
		errors.push({ msg: 'Passwords do not match' });
	}

	if (password.length < 6) {
		errors.push({ msg: 'Password must be at least 6 characters' });
	}

	if (errors.length > 0) {
		res.render('register', {
			errors,
			name,
			email,
			password,
			password2,
		});
	} else {
		const user = await User.findOne({ email: email });
		if (user) {
			errors.push({ msg: 'Email already exists' });
			res.render('register', {
				errors,
				name,
				email,
				password,
				password2,
			});
		} else {
			// Hash Password
			const salt = await bcrypt.genSalt();
			const newUser = new User();
			newUser.name = name;
			newUser.email = email;
			newUser.password = await bcrypt.hash(password, salt);
			newUser.salt = salt;
			newUser
				.save()
				.then(() => {
					req.flash(
						'success_msg',
						'You are succesfully registered , please login to continue',
					);
					res.redirect('/users/login');
				})
				.catch(err => console.log(err));
			console.log(newUser);
		}
	}
});

// Login Handle
router.post('/login', async (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/users/login',
		failureFlash: true,
	})(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

module.exports = router;
