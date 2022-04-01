const mqtt = require('mqtt')
const { Command } = require('commander')
const Pool = require('pg').Pool
const pool = new Pool({
    user: 'cbm',
    host: 'postgres',
    database: 'cbm',
    password: 'password',
    port: 5432,
})

module.exports = (io) => {

    /*
    Subscribe (listen) to MQTT topic and start emitting
    data after successful MQTT connection to Socket IO
    */

    //Broker parameter variables
    const brokerAddress = 'broker.hivemq.com'
    const brokerPort = 1883

    const program = new Command()
    program
        .option('-p, --protocol <type>', 'connect protocol: mqtt, mqtts, ws, wss. default is mqtt', 'mqtt')
        .parse(process.argv)

    const HOST = process.env.MQTT_HOST || brokerAddress
    const DEF_PORT = parseInt(process.env.MQTT_PORT, 10) || brokerPort;

    const MQTT_TOPIC_LIST = [
        process.env.MQTT_TOPIC_GT101 || 'CbMData-gt101',
        process.env.MQTT_TOPIC_GT102 || 'CbMData-gt102',
        process.env.MQTT_TOPIC_GT103 || 'CbMData-gt103',
        process.env.MQTT_TOPIC_GT104 || 'CbMData-gt104',
        process.env.MQTT_TOPIC_GT105 || 'CbMData-gt105',
        process.env.MQTT_TOPIC_GT106 || 'CbMData-gt106'
    ]

    let connectUrl = `mqtt://${HOST}:${DEF_PORT}`

    let mqttClient = mqtt.connect(connectUrl)

    mqttClient.on('connect', () => {
        mqttClient.subscribe(MQTT_TOPIC_LIST, mqtt_subscribe)
    })

    // mqttClient.on('connect', mqtt_processMessage)

    mqttClient.on('message', mqtt_processMessage)

    mqttClient.on('reconnect', mqtt_reconnect)

    mqttClient.on('offline', mqtt_offline)

    mqttClient.on('error', mqtt_error)

    function mqtt_subscribe (err, granted) {
        console.log(`${program.protocol}: Subscribe to topic '${MQTT_TOPIC_LIST}'`)
        if (err) {console.log(err);}
    }

    function mqtt_reconnect(err)
    {
        console.log("Reconnect MQTT");
        if (err) {console.log(err);}
        mqttClient = mqtt.connect(connectUrl)
    }

    function mqtt_offline(err) {
        console.log(`(${program.protocol}): Offline`)
        if (err) {console.log(err);}
        io.emit('sensorStatus', 'Offline');
    }

    function mqtt_error(err) {
        console.log(`(${program.protocol}): Error!`)
        if(err) {console.log(err);}
        io.emit('sensorStatus', 'Offline');
    }

    function mqtt_processMessage(topic, payload) {

        let data = {}
        let message_str = ''
        let sensorData = {}

        //console.log('original', payload.toString())
        let parsedMessage = parseMessage(payload.toString())

        let sensor;
        let moduleId = "";
        let id = "";
        let sensorId;
        let totalPacket = "";

        let sensorType;
        if (parsedMessage.data && !parsedMessage.sensor) {
            message_str = parsedMessage.data.replace(/[\[\]']+/g, '')

            let boardNumber = message_str.substring(0, 2)
            let type = message_str.substring(2, 3)

            sensor = "accelerometer";

            if (boardNumber === "01") {
                moduleId = "0123456789"
            } else if (boardNumber === "02") {
                moduleId = "0223456789"
            } else if (boardNumber === "03") {
                moduleId = "0323456789"
            } else if (boardNumber === "04") {
                moduleId = "0423456789"
            } else if (boardNumber === "05") {
                moduleId = "0523456789"
            } else if (boardNumber === "06") {
                moduleId = "0623456789"
            } else moduleId = "0123456789"

            if (type === "1") {
                sensorType = "adxl35701"
            } else if (type === "2") {
                sensorType = "adcmxl302101"
            } else if (type === "3") {
                sensorType = "iadxl100201"
            } else sensorType = parsedMessage.sensor

            data = processAccelRawData(message_str, sensorType)

            sensorData = {
                "sensor": sensor,
                "sensorId": sensorType,
                "moduleId": moduleId,
                "data": data,
                "time": Date.now().toString()
            }

        } else if (!parsedMessage.totalpacket) {
            sensor = parsedMessage.sensor;
            sensorType = parsedMessage.id;
            moduleId = parsedMessage.moduleId;
            data = parsedMessage.data;

            sensorData = {
                "sensor": sensor.replace(/"/g, ''),
                "sensorId": sensorType.replace(/"/g, ''),
                "moduleId": moduleId.replace(/"/g, ''),
                "data": data,
                "time": Date.now().toString()
            }
        } else {
            sensor = parsedMessage.sensor;
            sensorType = parsedMessage.id;
            moduleId = parsedMessage.moduleId;
            data = parsedMessage.data;
            totalPacket = parsedMessage.totalpacket;

            sensorData = {
                "sensor": sensor.replace(/"/g, ''),
                "sensorId": sensorType.replace(/"/g, ''),
                "moduleId": moduleId.replace(/"/g, ''),
                "totalPacket": totalPacket,
                "time": Date.now().toString()
            }
        }

        io.emit('sensorData', JSON.stringify(sensorData));
        insert_message(message_str)
        console.log(sensorData)
    }

    function processAccelRawData(message_str) {

        // console.log('raw', message_str)
        let overallData = {}

        // let message_str = rawAccelData
        let sensorType = message_str.substring(2,3)
        let messageNum = message_str.substring(3,6)
        messageNum = parseInt(messageNum, 16).toString(10);
        let xRawDatas = []
        let yRawDatas = []
        let zRawDatas = []

        let xGValue = []
        let yGValue = []
        let zGValue = []

        xRawDatas.push(
            message_str.substring(6, 12),
            message_str.substring(24, 30),
            message_str.substring(42, 48),
            message_str.substring(60, 66),
            message_str.substring(78, 84),
            message_str.substring(96, 102),
            message_str.substring(114, 120),
            message_str.substring(132, 138)
        )

        yRawDatas.push(
            message_str.substring(12, 18),
            message_str.substring(30, 36),
            message_str.substring(48, 54),
            message_str.substring(66, 72),
            message_str.substring(84, 90),
            message_str.substring(102, 108),
            message_str.substring(120, 126),
            message_str.substring(138, 144)
        )

        zRawDatas.push(
            message_str.substring(18, 24),
            message_str.substring(36, 42),
            message_str.substring(54, 60),
            message_str.substring(72, 78),
            message_str.substring(90, 96),
            message_str.substring(108, 114),
            message_str.substring(126, 132),
            message_str.substring(144, 150)
        )

        // If sensorType is adxl357
        if (sensorType === '1') {
            xRawDatas.forEach(function (value) {
                    xGValue.push(computeAdxl(value))
                }
            )
            yRawDatas.forEach(function (value) {
                    yGValue.push(computeAdxl(value))
                }
            )
            zRawDatas.forEach(function (value) {
                    zGValue.push(computeAdxl(value))
                }
            )
        }

        // If sensorType is adcmxl3021
        if (sensorType === '2') {
            xRawDatas.forEach(function (value) {
                    xGValue.push(computeAdcm(value))
                }
            )
            yRawDatas.forEach(function (value) {
                    yGValue.push(computeAdcm(value))
                }
            )
            zRawDatas.forEach(function (value) {
                    zGValue.push(computeAdcm(value))
                }
            )
        }

        // If sensorType is iepe
        if (sensorType === '3') {
            xRawDatas.forEach(function (value) {
                    xGValue.push(computeIepe(value))
                }
            )
        }

        overallData = {
            "MessageNumber": messageNum,
            "x": xGValue,
            "y": yGValue,
            "z": zGValue
        }

        return overallData
    }

    // Parse Raw Data coming from mqtt server
    function parseMessage(rawData) {

        let regexp = new RegExp(/"([_a-z]\w*)":\s*("[^"]*"|\d+|\[[^\]\[]*])/g)
        let map = {};
        let m;

        while ((m = regexp.exec(rawData)) != null) {
            map[m[1]] = m[2];
        }

        // console.log('map', map)
        return map
    }

    function ExtractValue(data,key){
        const rx = new RegExp(key + ":(.*?)\\s+--");
        const values = rx.exec(data); // or: data.match(rx);
        return values && values[1];
    }

    // TODO: insert sensor data to db
    function insert_message(message_str) {
        const message_arr = extract_string(message_str);
        //console.log('extracted message', message_arr)

        const sensor = message_arr[0];
        const sensorId = message_arr[1];
        const moduleId = message_arr[2];
        const data = message_arr[3];

        //const { sensor, sensorId, moduleId, data } = {"sensor":"temperature","id":"adt731101","moduleId":"0523456789","data":[26]}

       /*
       pool.query('INSERT INTO sensors (sensor, sensorId, moduleId, data) VALUES ($1, $2, $3, $4)', [sensor, sensorId, moduleId, data], (error, results) => {
            if (error) {
                throw error
            }
            console.log(' successfully added sensor')
        })
        */
    }

    //split a string into an array of substrings
    function extract_string(message_str) {
         //convert to array
        return message_str.split(",");
    }

    function hex_to_ascii(str1)
    {
        // console.log('unparsed', str1)
        const hex = str1.toString();
        let str = '';
        for (let n = 0; n < hex.length; n += 2) {
            str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        }
        // console.log('parsed', str)
        return str;
    }

    function computeIepe (hex) {
        // console.log('hex','0x' + hex)
        const sensitivity = 100      //IEPE Sensitivity: 100mV/G
        const decimal = parseInt(hex, 16).toString(10);
        const iepeVoltage = (decimal * 5) / (2 ** 16)

        const gValue = ((iepeVoltage - 2.5) * 1000) / sensitivity
        //console.log('computed G Value ', gValue.toFixed(5))
        //console.log('\n')
        return (gValue.toFixed(5))
    }

    function computeAdxl (hex) {
        let value = '';

        var sensitivity
        const sensitivitySelector = 0
        switch (sensitivitySelector) {
            case 1: 
                sensitivity = 39  /  (10 ** 6)     //ADXL357 set to 20g
                break;
            case 2: 
                sensitivity = 78  /  (10 ** 6)     //ADXL357 set to 40g
                break;
            default: 
                sensitivity = 19.5  /  (10 ** 6)     //ADXL357 set to 10g
          }

        // Drop 4MSB: Hexadecimal
        hex = parseInt(hex, 16) & 0x0FFFFF
        
        // Hex to decimal
        const decimal = hex.toString(10);
        // console.log('decimal', decimal)

        // // get 2s compliment if greater than or equal to 0x8000
        if (decimal >= 524288) {
            value = get2sComplement(decimal,20)
            // console.log('2s complement', )
        } else {
            value = decimal
        }

        const gValue = value * sensitivity
        // console.log('computed G Value ', gValue.toFixed(5))
        // console.log('\n')
        return (gValue.toFixed(5))
    }

    function computeAdcm (hex) {

        let value = '';
        const sensitivity = 1.907 / (10 ** 3)

        // Drop 8MSB: Hexadecimal
        hex = parseInt(hex, 16) & 0x00FFFF
        
        // Hex to decimal
        const decimal = hex.toString(10);
        // console.log('decimal', decimal)


        // get 2s compliment if greater than or equal to 0x8000
        if (decimal >= 32768) {
            value = get2sComplement(decimal,16)
            // console.log('2s complement', value)
        } else {
            value = decimal
        }

        const gValue = value * sensitivity
        // console.log('gValue', gValue)
        // console.log('\n')
        return (gValue.toFixed(5))
    }

    function get2sComplement(val,bits)
        {
        if ((val & (1 << (bits - 1))) != 0)
            {
                val = val - (1 << bits)
            }
        return val;
        }
};
