const express = require('express');
const uuid = require('uuid');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const { requestCounter } = require('./metrics');
const client = require('prom-client');
const { logger, errorLogger } = require('./logger');

require('dotenv').config();

app.use((req, res, next) => {
	req.requestId = uuid.v4();
	next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load Mongoose
const mongoose = require('mongoose');

// Global Teacher Object which will be the instance of MongoDB document
var Teacher;
async function connectMongoose() {
	await mongoose
		.connect(process.env.MONGOOSE_CONNECT, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log('mongoose connected..');
		});
	require('./teacher');
	Teacher = mongoose.model('Teacher');
}

// Load initial modules
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

// GET all teachers
app.get('/teachers', async (req, res) => {
	requestCounter.inc({ http: 'get', route: 'teacher', status: 200 });
	Teacher.find()
		.then((teachers) => {
			res.send(teachers);
		})
		.catch((err) => {
			requestCounter.inc({ http: 'get', route: 'teacher', status: 400 });
			if (err) {
				throw err;
			}
		});
});

// GET single teacher
app.get('/teachers/:uid', async (req, res) => {
	requestCounter.inc({ http: 'get', route: 'teacher', status: 200 });
	Teacher.findById(req.params.uid)
		.then((teacher) => {
			if (teacher) {
				res.json(teacher);
			} else {
				res.sendStatus(404);
			}
		})
		.catch((err) => {
			requestCounter.inc({ http: 'get', route: 'teacher', status: 400 });
			if (err) {
				throw err;
			}
		});
});

// Create new teacher
app.post('/teacher', async (req, res) => {
	const newTeacher = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		address: req.body.address,
		courses: req.body.courses,
	};

	// Create new Teacher instance..
	const teacher = new Teacher(newTeacher);
	teacher
		.save()
		.then((r) => {
			logger.info('teacher ' + teacher.email + ' is added', {
				requestId: req.requestId,
			});
			requestCounter.inc({ http: 'post', route: 'teacher', status: 200 });
			res.send('Teacher created..');
		})
		.catch((err) => {
			if (err) {
				errorLogger.error('teacher ' + teacher.email + " can't be added", {
					requestId: req.requestId,
				});
				requestCounter.inc({ http: 'post', route: 'teacher', status: 400 });
				throw err;
			}
		});
});

// Delete teacher by teacherId
app.delete('/teachers/:uid', async (req, res) => {
	Teacher.findByIdAndDelete(req.params.uid)
		.then(() => {
			logger.info('teacher ' + req.params.uid + ' is deleted', {
				requestId: req.requestId,
			});
			requestCounter.inc({ http: 'delete', route: 'teacher', status: 200 });
			res.send('Teacher deleted with success...');
		})
		.catch(() => {
			errorLogger.error('teacher ' + req.params.uid + " can't be deleted", {
				requestId: req.requestId,
			});
			requestCounter.inc({ http: 'delete', route: 'teacher', status: 400 });

			res.sendStatus(404);
		});
});

// GET all courses for a teacher
app.get('/teachers/:uid/courses', async (req, res) => {
	try {
		axios
			.get(`http://ms-course-service:80/courses?uid=${req.params.uid}`)
			.then((courses) => {
				if (courses) {
					requestCounter.inc({ http: 'get', route: 'course', status: 200 });
					res.send(courses.data);
				}
			})
			.catch((err) => {
				requestCounter.inc({ http: 'get', route: 'course', status: 400 });

				res.sendStatus(404).send(err);
			});
	} catch (error) {
		res.sendStatus(400).send('Error while seeing the course');
	}
});

// Create new course for a teacher
app.post('/teachers/:uid/course', async (req, res) => {
	try {
		const courseResponse = await axios.post(
			`http://ms-course-service:80/course`,
			{
				name: req.body.name,
				teacherId: mongoose.Types.ObjectId(req.params.uid),
				time: req.body.time,
			}
		);

		if (courseResponse.status === 200) {
			Teacher.findById(req.params.uid, (err, teacher) => {
				teacher.courses.push(courseResponse.data._id);
				teacher
					.save()
					.then(() => {
						res.send(
							requestCounter.inc({
								http: 'post',
								route: 'course',
								status: 200,
							})`Course created for teacher:${teacher.email} with courseId:${courseResponse.data._id}`
						);
					})
					.catch((e) => {
						requestCounter.inc({ http: 'post', route: 'course', status: 400 });

						res.send("failed to add courseId in teacher's doc");
					});
			});
		} else {
			requestCounter.inc({ http: 'post', route: 'course', status: 400 });
			res.send('Course not created..');
		}
	} catch (error) {
		requestCounter.inc({ http: 'post', route: 'course', status: 400 });
		res.sendStatus(400).send('Error while creating the course');
	}
});

// Delete all the courses for an teacher
app.delete('/teachers/:uid/courses', async (req, res) => {
	axios
		.delete(`http://ms-course-service:80/courses?uid=${req.params.uid}`)
		.then((delRes) => {
			requestCounter.inc({ http: 'delete', route: 'course', status: 200 });

			if (delRes.data.success) {
				res.send('Courses deleted..');
			} else {
				requestCounter.inc({ http: 'delete', route: 'course', status: 400 });

				res.sendStatus(404).send(delRes.data);
			}
		})
		.catch((err) => {
			requestCounter.inc({ http: 'delete', route: 'course', status: 400 });

			res.sendStatus(404).send(err);
		});
});

// APP listening on port
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
	console.log('Up and running! -- This is our Teacher service');
});
