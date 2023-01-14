const mongoose = require('mongoose');

// Course Model

mongoose.model('Course', {
	name: {
		type: String,
		required: true,
	},
	teacherId: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
	},
	time: {
		type: Number,
		required: true,
	},
});
