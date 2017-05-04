## 阿里云资源监控程序

### 功能概述

可以将腾讯云服务器的 `内存` 和 `CPU`一天内的平均数据和最大峰值发送到slack的组或用户下。

如图所示：

<img src="http://oe1qcatok.bkt.clouddn.com/20170504149386617274533.png" width="60%" height="60%">

### 变量配置

注意：阿里云需要安装监控插件才能正常获取数据

启动服务前，需要设置如下变量：

```
"ALIYUN_ACCESSKEY_ID" = "Your accesskeyId here",
"ALIYUN_ACCESSKEY_SECRET" = "Your accesskeySecret here",
"SLACK_HOOK_URL" = "Your Slack Hook url here",
"SLACK_CHANNEL" = "Your Slack send to Channel"
```

### 配置服务

根据服务器所在位置不同，启动命令添加的参数也不同:

```
华东1(杭州):hangzhou，华东2(上海):shanghai，华北1(青岛):qingdao，华北2(北京):beijing，华南1(深圳):shenzhen，华北3(张家口):zhangjiakou, 香港:hongkang, 亚太东南1(新加坡):singapore, 美国西部1(硅谷):silicon_valley, 美国东部1(弗吉尼亚): virginia
```

启动服务入口文件为 `app.js` ,在文件底部添加不同的语句。

- 立即执行

```
checkServerData('shanghai');  
```

- 定时执行

```
schedule.scheduleJob('00 08 * * 1-5', () => checkServerData('shanghai'));
```

### 启动服务

```
node app.js
```
