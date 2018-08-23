const request = require('request').defaults({
    pool: { maxSockets: 10 },
    forever: true
});
const fs = require('fs');
const colors = require("colors");


function WebpackUploadPlugin(options) {
    const { receiver, to, rules } = options;
    this.receiver = receiver;
    this.to = to;
    this.rules = rules;
    this.queue = [];
}


WebpackUploadPlugin.prototype.apply = function (compiler, callback) {

    compiler.plugin('done', stats => {
        const { compilation } = stats;
        const assetsContent = compilation.assets;
        const assetsName = Object.keys(compilation.assets);
        const rules = this.rules;
        const uploadArr = assetsName.reduce((sum, asset) => {
            sum.push({
                fileName: this.getFileName(asset),
                fileServerPath: this.getAssetPath(rules, asset),
                fileLocalPath: assetsContent[asset].existsAt,
                fileRootPath: this.to
            });
            return sum;
        }, []);

        this.queue = uploadArr.map(item => ({
            file: item,
            url: this.receiver
        }));

        const fire = this.walkQueue(this.upload, this.queue);
        fire();
    });
}


WebpackUploadPlugin.prototype.walkQueue = function (upload, queue) {
    const self = this;
    return function () {
        const obj = queue.shift();
        obj && upload(obj, self.walkQueue(upload, queue));
    }
}

WebpackUploadPlugin.prototype.upload = function (obj, next) {
    const startTime = Date.now();
    const { url, file } = obj;
    const buffer = fs.createReadStream(file.fileLocalPath);
    const formData = {
        fileName: file.fileName,
        fileServerPath: file.fileServerPath,
        fileContent: buffer,
        fileRootPath: file.fileRootPath
    };
    request.post({
        url,
        formData
    }, function (error, response) {
        if (!error && response.statusCode == 200) {
            const endTime = Date.now();
            const { body: res } = response;
            const costTime = ((endTime - startTime) / 1000).toFixed(2);
            if (/^\[Failed\]/i.test(res)) {
                console.log(`[Cost:${costTime}s]${res}`.red);
            } else if (/^\[Succeed\]/i.test(res)) {
                console.log(`[Cost:${costTime}s]${res}`.green);
            } else {
                console.log(res.yellow);
            }
            next && next();
        } else {
            console.log(`Failed: ${file.fileName} >>>>>>>>>>>>>>>> Post Error: ${error}`.red);
        }
    });
}

WebpackUploadPlugin.prototype.getAssetPath = function (rules, assetName) {
    for (let i = 0, len = rules.length; i < len; i++) {
        if (rules[i].test.test(assetName)) {
            return rules[i].path.endsWith('/') ? rules[i].path : (rules[i].path + '/');
        }
    }
}

WebpackUploadPlugin.prototype.getFileName = function (assetName) {
    return assetName.split('/').pop();
}

module.exports = WebpackUploadPlugin;