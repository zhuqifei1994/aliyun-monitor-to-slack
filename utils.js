var co = require('co');

//阿里云节点监控
function aliyunNodeData(data) {
	return data.Instance.map(item => item.InstanceName);
}

//阿里云数据监控
function aliyunMonitorData(region, data, type) {
	return co(function* () {
		var nodeId = data.Instance.map(item => item.InstanceId);
		var dataAverage = [];
		for (var i = 0; i < nodeId.length; i++) {
			var node_id = nodeId[i];
			var node_data = yield type(region, node_id);
			var dataAvg = node_data.map(item => item.Average);
			var average = dataAvg.length;
			var sum = dataAvg.reduce((previous, current) => current += previous);
			var avg = sum / average;
			dataAverage.push(avg);
		}
		return dataAverage;
	});
}

//阿里云峰值监控
function aliyunMaxData(region, data, type) {
	return co(function* () {
		Array.prototype.max = function () {
			var max = this[0];
			for (var i = 1; i < this.length; i++) {
				if (this[i] > max) {
					max = this[i];
				}
			}
			return max;
		}

		var nodeId = data.Instance.map(item => item.InstanceId);
		var datamax = [];
		for (var i = 0; i < nodeId.length; i++) {
			var node_id = nodeId[i];
			var node_Data = yield type(region, node_id);
			var node_data = node_Data.map(item => item.Maximum);
			var node_max = node_data.max();
			datamax.push(node_max);
		}
		return datamax;
	});
}

module.exports = {
	aliyunMonitorData,
	aliyunMaxData,
	aliyunNodeData
}