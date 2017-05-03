var Metrics = require("aliyun-metrics")
var moment = require('moment');
var ALY = require('aliyun-sdk');

var client = new Metrics({
    accesskeyId: process.env.ALIYUN_ACCESSKEY_ID,
    accesskeySecret: process.env.ALIYUN_ACCESSKEY_SECRET,
})

var ecs = new ALY.ECS({
    accessKeyId: process.env.ALIYUN_ACCESSKEY_ID,
    secretAccessKey: process.env.ALIYUN_ACCESSKEY_SECRET,
    endpoint: 'https://ecs.aliyuncs.com',
    apiVersion: '2014-05-26'
});

function nodeMonitor(region) {
    return new Promise((resolve, reject) => {
        ecs.describeInstances({
            RegionId: region
        }, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data.Instances);
            }
        });
    });
}

function memMonitor(region, node) {
    var StartTime = moment().subtract(1, 'days').format('YYYY-MM-DD hh:mm:ss');
    var EndTime = moment().format('YYYY-MM-DD hh:mm:ss');
    var dimensions = {
        instanceId: node
    }

    return new Promise((resolve, reject) => {
        client.queryData({
            project: 'acs_ecs_dashboard',
            metric: 'memory_usedutilization',
            period: 300,
            // region: region,
            startTime: StartTime,
            endTime: EndTime,
            dimensions: dimensions
        }, function (error, data) {
            if (error) {
                reject(error)
            } else {
                console.log(data.datapoints);
                resolve(data.datapoints);
            }
        });
    });
}

function cpuMonitor(region, node) {
    var StartTime = moment().subtract(1, 'days').format('YYYY-MM-DD hh:mm:ss');
    var EndTime = moment().format('YYYY-MM-DD hh:mm:ss');
    var dimensions = {
        instanceId: node
    }

    return new Promise((resolve, reject) => {
        client.queryData({
            project: 'acs_ecs_dashboard',
            metric: 'CPUUtilization',
            period: '300',
            // region: region,
            startTime: StartTime,
            endTime: EndTime,
            dimensions: dimensions
        }, function (error, data) {
            if (error) {
                reject(error)
            } else {
                console.log(data.datapoints);
                resolve(data.datapoints);
            }
        });
    });
}

module.exports = {
    nodeMonitor,
    memMonitor,
    cpuMonitor
}
