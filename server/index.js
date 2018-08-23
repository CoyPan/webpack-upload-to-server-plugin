const express = require('express');
const multipart = require('connect-multiparty');
const fs = require('fs-extra');

const app = express();
const multipartMiddleware = multipart();

// change the port as you need.
const port = '8080';

app.post('/upload', multipartMiddleware, (req, res) => {

    const { fileContent } = req.files;
    const { fileName, fileServerPath, fileRootPath } = req.body;

    const destDir = fileRootPath + fileServerPath;

    fs.ensureDir(destDir, err => {
        if (err) {
            res.send(`[Failed]${fileName} >>>>>>>>>>>>>>>> ${fileRootPath + fileServerPath + fileName}. error:${err}`);
            return;
        } 
        fs.copy(fileContent.path, destDir + fileName, error => {
            if (error) {
                res.send(`[Failed]${fileName} >>>>>>>>>>>>>>>> ${fileRootPath + fileServerPath + fileName}. error:${error}`);
                return;
            }
            fs.unlinkSync(fileContent.path);
            res.send(`[Succeed]${fileName} >>>>>>>>>>>>>>>> ${fileRootPath + fileServerPath + fileName}`);
        })
    });
});

app.get('/', (req, res) => {
    res.send('I am ready for that. You know it');
});

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});