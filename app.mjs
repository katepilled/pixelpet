import 'dotenv/config';
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import { Passport } from 'passport';
import bcrypt from 'bcrypt';
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

// routes
app.get('/', (req, res) => {
	res.render('landing');
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', async (req, res) => {
	// hash password
	try {
    console.log(req.body.password)
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		const newUser = new User({
			username: req.body.username,
			password: hashedPassword,
		});
		newUser.save();
		res.redirect('/name');
	} catch (err) {
		console.log(err);
	}
});

app.get('/name', (req, res) => {
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

app.listen(process.env.PORT || 3000);
