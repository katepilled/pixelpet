import 'dotenv/config';
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy } from 'passport-local';
import session from 'express-session';
import { fileURLToPath } from 'url';
import hbs from 'hbs';

import User from './src/models/user.mjs';
import Pet from './src/models/pet.mjs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// handlebars helpers
hbs.registerHelper('if_lte', function (a, b, options) {
	if (a <= b) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

hbs.registerHelper('if_eq', function (a, b, options) {
	return a === b ? options.fn(this) : options.inverse(this);
});

// configure templating to hbs
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

// connect to DB
mongoose.connect(process.env.DSN);
mongoose.connection.on('connected', () => {
	console.log('Connected to MongoDB');
});

// set up session
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

// do not store cached versions of pages
app.use((req, res, next) => {
	res.setHeader('Cache-Control', 'no-store');
	next();
});

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
	// redirect to the landing page if not authenticated
	res.redirect('/');
}

// depreciate pet stasts every hour
const updatePetStats = async () => {
	try {
		const pets = await Pet.find();

		pets.forEach(async (pet) => {
			pet.happiness_level -= 4;
			pet.hunger_level -= 4;
			pet.cleanliness -= 4;

			// stats must stay within 0-100
			pet.happiness_level = Math.max(0, Math.min(100, pet.happiness_level));
			pet.hunger_level = Math.max(0, Math.min(100, pet.hunger_level));
			pet.cleanliness = Math.max(0, Math.min(100, pet.cleanliness));

			await pet.save();
		});
	} catch (error) {
		console.error('Error updating pet stats:', error);
	}
};

// add age every day
const updatePetAge = async () => {
	try {
		const pets = await Pet.find();

		pets.forEach(async (pet) => {
			pet.age += 1;
			await pet.save();
		});
	} catch (error) {
		console.error('Error updating pet stats:', error);
	}
};

// update pet stats every hour
const hour = 3600000; // 1 hour in milliseconds
const day = 86400000; // 1 day in milliseconds
setInterval(updatePetStats, hour);
setInterval(updatePetAge, day);

// routes
app.get('/', (req, res) => {
	if (req.isAuthenticated()) {
		res.redirect('/pet');
	}
	res.render('landing');
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', (req, res, next) => {
	passport.authenticate('local', (err, user) => {
		if (err) {
			return next(err);
		}

		if (!user) {
			return res.render('login', {
				errorMessage: 'invalid username or password (シ. .)シ',
			});
		}

		req.logIn(user, (loginErr) => {
			if (loginErr) {
				return next(loginErr);
			}
			return res.redirect('/pet');
		});
	})(req, res, next);
});

app.post('/logout', (req, res) => {
	req.logout((err) => {
		console.error(err);
	});
	res.redirect('/');
});

app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', async (req, res) => {
	try {
		await User.register({ username: req.body.username }, req.body.password);
		passport.authenticate('local')(req, res, () => {
			res.redirect('/hatch');
		});
	} catch (err) {
		let errorMessage = 'registration failed :(!! please try again...';
		if (err.name === 'UserExistsError') {
			errorMessage = 'oops, that username is already taken!';
		}
		res.render('register', { errorMessage });
	}
});
app.get('/hatch', isAuthenticated, (req, res) => {
	res.render('hatch');
});

// hatch endpoint, determines type of pet based on egg
app.post('/hatch', async (req, res) => {
	let pet;
	console.log(req.body.egg);
	if (req.body.egg === 'egg1') {
		pet = new Pet({
			type: 'cat',
			owner: req.user._id,
		});
	} else if (req.body.egg === 'egg2') {
		pet = new Pet({
			type: 'dog',
			owner: req.user._id,
		});
	} else if (req.body.egg === 'egg3') {
		pet = new Pet({
			type: 'bunny',
			owner: req.user._id,
		});
	}
	console.log(pet.type);
	await pet.save();
	pet = await Pet.findOne({ owner: req.user._id });
	console.log(pet.type);
	res.redirect('/meeting');
});

app.get('/meeting', isAuthenticated, async (req, res) => {
	const pet = await Pet.findOne({ owner: req.user._id });
	res.render('meeting', { pet });
});

app.get('/name', isAuthenticated, (req, res) => {
	res.render('name');
});

app.post('/name', async (req, res) => {
	try {
		const pet = await Pet.findOne({ owner: req.user._id });
		if (pet) {
			pet.name = req.body.name;
			await pet.save();
			res.redirect('/pet');
		} else {
			const pet = new Pet({
				name: req.body.name,
				age: 0,
				owner: req.user._id,
			});
			await pet.save();
			res.redirect('/pet');
		}
	} catch (err) {
		console.error(err);
	}
});

app.get('/pet', isAuthenticated, async (req, res) => {
	try {
		const pet = await Pet.findOne({ owner: req.user._id });

		if (pet) {
			res.render('pet', { pet });
		} else {
			res.redirect('/hatch');
		}
	} catch (error) {
		console.error(error);
	}
});

// pet state endpoint
app.get('/pet/state', async (req, res) => {
	try {
		const pet = await Pet.findOne({ owner: req.user._id });

		if (pet) {
			res.json({
				type: pet.type,
				name: pet.name,
				age: pet.age,
				hunger_level: pet.hunger_level,
				happiness_level: pet.happiness_level,
				cleanliness: pet.cleanliness,
			});
		} else {
			res.status(404).json({ error: 'Pet not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.post('/pet/feed', async (req, res) => {
	try {
		const pet = await Pet.findOne({ owner: req.user._id });
		if (pet) {
			pet.hunger_level += 10;
			await pet.save();
			// return new hunger level
			res.json(pet.hunger_level);
		}
	} catch (error) {
		console.error(error);
	}
});

app.post('/pet/play', async (req, res) => {
	try {
		const pet = await Pet.findOne({ owner: req.user._id });
		if (pet) {
			pet.happiness_level += 10;
			await pet.save();
			res.json(pet.happiness_level);
		}
	} catch (error) {
		console.error(error);
	}
});

app.post('/pet/clean', async (req, res) => {
	try {
		const pet = await Pet.findOne({ owner: req.user._id });
		if (pet) {
			pet.cleanliness += 10;
			await pet.save();
			res.json(pet.cleanliness);
		}
	} catch (error) {
		console.error(error);
	}
});

app.get('/warning', (req, res) => {
	res.render('warning');
});

app.post('/pet/delete', async (req, res) => {
	try {
		await Pet.findOneAndDelete({ owner: req.user._id });
		res.redirect('/hatch');
	} catch (error) {
		console.error(error);
	}
});

app.get('/about', (req, res) => {
	res.render('about');
});

// 404 error handler
app.use((req, res) => {
	res.status(404).render('404');
});

app.listen(process.env.PORT || 3000);
