// Load express
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
require('dotenv').config();

// Load Mongoose
const mongoose = require('mongoose');

// Global Course Object which will be the instance of MongoDB document
var Course;
async function connectMongoose() {
	await mongoose
		.connect(process.env.MONGOOSE_CONNECT, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log('mongoose connected..');
		});
	require('./course');
	Course = mongoose.model('Course');
}

// Define the Initial load
async function initialLoad() {
	await connectMongoose();
}

initialLoad();

// get one course by teacher
// or get all courses for a teacher
// get all courses
app.get('/courses', async (req, res) => {
	if (!req.query.cid && !req.query.uid) {
		Course.find()
			.then((courses) => {
				res.send(courses);
			})
			.catch((err) => {
				if (err) {
					throw err;
				}
			});
	}
	if (!req.query.cid && req.query.uid) {
		Course.find({ teacherId: req.query.uid }).then((courses) => {
			if (courses) {
				res.json(courses);
			} else {
				res.sendStatus(404);
			}
		});
	} else if (req.query.cid && req.query.uid) {
		Course.find({ _id: req.query.cid, teacherId: req.query.uid }).then(
			(course) => {
				if (course) {
					res.json(course);
				} else {
					res.sendStatus(404);
				}
			}
		);
	}
});

// Create an course for a user
app.post('/course', async (req, res) => {
	const newCourse = {
		name: req.body.name,
		teacherId: req.body.teacherId,
		time: req.body.time,
	};

	// Create new Course instance..
	const course = new Course(newCourse);
	course
		.save()
		.then((courseObj) => {
			res.send(courseObj);
		})
		.catch((err) => {
			if (err) {
				throw err;
			}
		});
});

// Delete a single course
app.delete('/courses/:cid', async (req, res) => {
	Course.findByIdAndDelete(req.params.cid)
		.then(() => {
			res.send('Course deleted with success...');
		})
		.catch(() => {
			res.sendStatus(404);
		});
});

// Delete all courses for a user
app.delete('/courses', async (req, res) => {
	Course.findOneAndDelete({ customerId: req.query.uid }).then((o) => {
		if (o) {
			res.send({ success: true });
		} else {
			res.sendStatus(404);
		}
	});
});

// APP listening on port 5151
app.listen(5051, () => {
	console.log('Up and running! -- This is our Courses service');
});
