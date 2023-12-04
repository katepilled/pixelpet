document.addEventListener('DOMContentLoaded', main);

class Pet {
	constructor() {
		this.pet = null;
	}

	async updatePetState() {
		try {
			const res = await fetch('/pet/state', { method: 'GET' });
			this.pet = await res.json();

			// adjust greeting based on pet stats
			if (this.pet.hunger_level < 60) {
				this.updateStatus(greeting, `${this.pet.name} is hungry!`);
			} else if (this.pet.cleanliness < 60) {
				this.updateStatus(greeting, `${this.pet.name} needs a bath!`);
			} else if (this.pet.happiness_level < 60) {
				this.updateStatus(greeting, `${this.pet.name} wants to play!`);
			} else {
				this.updateStatus(greeting, `${this.pet.name} is so happy to see you!`);
			}

			// update pet stats
			this.updateStatus(hunger, this.pet.hunger_level, 'full');
			this.updateStatus(happiness, this.pet.happiness_level, 'happy');
			this.updateStatus(cleanliness, this.pet.cleanliness, 'clean');
		} catch (error) {
			console.log(error);
		}
	}

	updateStatus(element, value, adjective) {
		if (element === greeting) {
			element.innerHTML = value;
		} else {
			element.innerHTML = `${value}% ${adjective}`;
		}
	}

	async updatePetStats(endpoint, element, adjective) {
		try {
			const res = await fetch(endpoint, { method: 'POST' });
			if (!res.ok) {
				throw new Error(`Failed to ${adjective} pet`);
			}
			const newValue = await res.json();
			this.updatePetState();
			this.updateStatus(element, newValue, adjective);
		} catch (error) {
			console.log(error);
		}
	}
}

function main() {
	const pet = new Pet();

	const feedBtn = document.getElementById('feedBtn');
	const playBtn = document.getElementById('playBtn');
	const cleanBtn = document.getElementById('cleanBtn');

	const hunger = document.getElementById('hunger');
	const happiness = document.getElementById('happiness');
	const cleanliness = document.getElementById('cleanliness');

	// initial update
	pet.updatePetState();

	// feed pet
	feedBtn.addEventListener('click', (event) => {
		event.preventDefault();
		pet.updatePetStats('/pet/feed', hunger, 'full');
	});

	// play with pet
	playBtn.addEventListener('click', (event) => {
		event.preventDefault();
		pet.updatePetStats('/pet/play', happiness, 'happy');
	});

	// clean pet
	cleanBtn.addEventListener('click', (event) => {
		event.preventDefault();
		pet.updatePetStats('/pet/clean', cleanliness, 'clean');
	});
}
