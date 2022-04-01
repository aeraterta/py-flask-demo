const Sensor = require('../models').Sensor;

module.exports = {
    create(req, res) {
        return Sensor
            .create({
                sensor: req.body.sensor,
                sensorId: req.body.sensorId,
                moduleId: req.body.moduleId,
                data: req.body.data,
            })
            .then((sensor) => {
                res.status(201).json({
                    success: true,
                    message: 'Successfully saved a new sensor data',
                });
            })
            .catch((error) => res.status(400).send(error));
    },
    list(req, res) {
        return Sensor
            .findAll()
            .then((sensors) => {
                if (sensors === null) {
                    res.status(200)
                        .send('no sensors');
                } else {
                    res.status(200)
                        .send(sensors);
                }
            })
            .catch((error) => res.status(400).send(error.message));
    },
};
