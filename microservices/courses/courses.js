// Load express
const express = require('express');
const app = express();
const uuid = require('uuid');
const bodyParser = require('body-parser');
const client = require('prom-client');

const { requestCounter } = require('./metrics');
const { logger, errorLogger } = require('./logger');
app.use((req, res, next) => {
    req.requestId = uuid.v4();
    next();
});
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

app.get('/', (req, res) => {
	res.send('This is our main endpoint');
});

app.get('/metrics', async (req, res) => {
	try {
		return res.status(200).send(await client.register.metrics());
	} catch (err) {}
});

// get one course by teacher
// or get all courses for a teacher
// get all courses
app.get('/courses', async (req, res) => {
	if (!req.query.cid && !req.query.uid) {
		Course.find()
			.then((courses) => {
				requestCounter.inc({ http: 'get', route: 'course', status: 200 });

				res.send(courses);
			})
			.catch((err) => {
				requestCounter.inc({ http: 'get', route: 'course', status: 400 });

				if (err) {
					throw err;
				}
			});
	} else if (!req.query.cid && req.query.uid) {
		Course.find({ teacherId: req.query.uid }).then((courses) => {
			if (courses) {
				requestCounter.inc({ http: 'get', route: 'course', status: 200 });

				res.json(courses);
			} else {
				requestCounter.inc({ http: 'get', route: 'course', status: 400 });

				res.sendStatus(404);
			}
		});
	} else if (req.query.cid && req.query.uid) {
		Course.find({ _id: req.query.cid, teacherId: req.query.uid }).then(
			(course) => {
				if (course) {
					requestCounter.inc({ http: 'get', route: 'course', status: 200 });

					res.json(course);
				} else {
					requestCounter.inc({ http: 'get', route: 'course', status: 400 });

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
			requestCounter.inc({ http: 'post', route: 'course', status: 200 });
			logger.info('Course ' + course.name + 'is created', {
				requestId: req.requestId,
			});
			res.send(courseObj);
		})
		.catch((err) => {
			if (err) {
				requestCounter.inc({ http: 'post', route: 'course', status: 400 });
				errorLogger.error('Course ' + course.name + ' is not created', {
					requestId: req.requestId,
				});

				throw err;
			}
		});
});

// Delete a single course
app.delete('/courses/:cid', async (req, res) => {
	Course.findByIdAndDelete(req.params.cid)
		.then(() => {
			requestCounter.inc({ http: 'delete', route: 'course', status: 200 });
			logger.info('Course ' + course.name + ' is created', {
				requestId: req.requestId,
			});

			res.send('Course deleted with success...');
		})
		.catch(() => {
			requestCounter.inc({ http: 'delete', route: 'course', status: 400 });
			errorLogger.error('Course ' + course.name + ' is not deleted', {
				requestId: req.requestId,
			});

			res.sendStatus(404);
		});
});

// Delete all courses for a user
app.delete('/courses', async (req, res) => {
	Course.findOneAndDelete({ customerId: req.query.uid }).then((o) => {
		if (o) {
			requestCounter.inc({ http: 'delete', route: 'course', status: 200 });

			res.send({ success: true });
		} else {
			requestCounter.inc({ http: 'delete', route: 'course', status: 400 });

			res.sendStatus(404);
		}
	});
});

// APP listening on port
const PORT = process.env.PORT || 5051;
app.listen(PORT, () => {
	console.log('Up and running! -- This is our Courses service');
});
