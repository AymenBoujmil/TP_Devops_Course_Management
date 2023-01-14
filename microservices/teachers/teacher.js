const mongoose = require('mongoose');

// User Model

mongoose.model('Teacher', {
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: false,
	},
	courses: {
		type: Array,
	},
});
