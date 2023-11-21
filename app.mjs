import 'dotenv/config';
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy } from 'passport-local';
import session from 'express-session';
import { fileURLToPath } from 'url';

import User from './src/models/user.mjs';
import Pet from './src/models/pet.mjs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static('public'));

// configure templating to hbs
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

// connect to DB
mongoose.connect(process.env.DSN);
mongoose.connection.on('connected', () => {
	console.log('Connected to MongoDB');
});

app.use(express.urlencoded({ extended: false }));

// set up session
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new Strategy(User.authenticate()));

// middleware to check if authenticated
function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
	  return next();
	}
	// Redirect to the login page if not authenticated
	res.redirect('/');
  }

// routes
app.get('/', (req, res) => {
	res.render('landing');
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/name',
		failureRedirect: '/',
	})
);

app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', async (req, res) => {
	// Use the User.register method provided by passport-local-mongoose
	User.register({ username: req.body.username }, req.body.password, (err) => {
		if (err) {
			console.error(err);
			return res.json({ success: false, message: err.message });
		}
		// Log in the user after successful registration
		passport.authenticate('local')(req, res, () => {
			res.redirect('/');
		});
	});
});

app.get('/name', isAuthenticated, (req, res) => {
	res.render('name');
});

app.post('/name', (req, res) => {
	res.send('You named your pet ' + req.body.name + '!');
	const pet = new Pet({
		name: req.body.name,
		age: 12,
	});

	pet.save();
});

app.get('/pet', isAuthenticated, (req, res) => {
	res.render('pet');
});

app.listen(process.env.PORT || 3000);
