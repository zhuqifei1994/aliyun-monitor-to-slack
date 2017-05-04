var schedule = require('node-schedule');
var co = require('co');
var dedent = require('dedent-js');
var express = require('express');
var app = express();
var Slack = require('node-slack');
var slack = new Slack(process.env.SLACK_HOOK_URL);
var moment = require('moment');
var utils = require('./utils.js');
var aliyun = require('./lib/aliyun.js');

var aliyunMem = aliyun.memMonitor;
var aliyunCPU = aliyun.cpuMonitor;
var aliyunNode = aliyun.nodeMonitor;

function checkAliyunData(regionCode) {
	return co(function* () {
		var regions = {
			hangzhou: {
                name: 'cn-hangzhou',
                fulltext: '华东1(杭州)节点监控'
            },
            shanghai: {
                name: 'cn-shanghai',
                fulltext: '华东2(上海)节点监控',
            },
            qingdao: {
                name: 'cn-qingdao',
                fulltext: '华北1(青岛)节点监控'
            },
            beijing: {
                name: 'cn-beijing',
                fulltext: '华北2(北京)节点监控'
            },
            shenzhen: {
                name: 'cn-shenzhen',
                fulltext: '华南1(深圳)节点监控'
            },
            zhangjiakou: {
                name: 'cn-zhangjiakou',
                fulltext: '华北3(张家口)节点监控'
            },
            hongkang: {
                name: 'cn-hongkang',
                fulltext: '香港节点监控'
            },
            singapore: {
                name: 'ap-southeast-1',
                fulltext: '亚太东南1(新加坡)节点监控'
            },
            silicon_valley: {
                name: 'us-west-1',
                fulltext: '美国西部1(硅谷)节点监控'
            },
            virginia: {
				name: 'us-east-1',
				fulltext: '美国东部1(弗吉尼亚)节点监控'
			}
		}
		var region = regions[regionCode];

		console.log(`check servers stats, region: ${region.name}`);
		var data = yield aliyunNode(region.name);
		var name_dataList = utils.aliyunNodeData(data);

		console.log(`get cpu stats, region: ${region.name}`);
		var cpu_dataAverage = yield utils.aliyunMonitorData(region.name, data, aliyunCPU);

		console.log(`get memory stats, region: ${region.name}`);
		var mem_dataAverage = yield utils.aliyunMonitorData(region.name, data, aliyunMem);

		var cpu_Max = yield utils.aliyunMaxData(region.name, data, aliyunCPU);
		var mem_Max = yield utils.aliyunMaxData(region.name, data, aliyunMem);

		var node_total = name_dataList.length;
		var attachments = []
		for (var i = 0; i < node_total; i++) {
			var node_name = name_dataList[i];
			var cpu_data = cpu_dataAverage[i].toFixed(2);
			var mem_data = mem_dataAverage[i].toFixed(2);
			var cpu_max = cpu_Max[i];
			var mem_max = mem_Max[i];

			var color;
			if (cpu_data >= 80 || mem_data >= 80) {
				color = 'danger';
			} else if (cpu_data >= 70 || mem_data >= 70) {
				color = 'warning';
			} else {
				color = 'good';
			}

			attachments.push({
				title: node_name,
				color: color,
				text: dedent`
			    CPU (平均值:${cpu_data}% ; 峰值:${cpu_max}%)
			    内存 (平均值:${mem_data}% ; 峰值:${mem_max}%)
			    `
			});
		}

		yield slack.send({
			text: region.fulltext,
			attachments: attachments,
			channel: process.env.SLACK_CHANNEL
		});
	}).then(() => {
		console.log('aliyun monitor done!')
	}).catch(e => {
		console.error(e);
	});
}

var port = 8080;
app.listen(port, () => {
	console.log('listening on port', port);
});