## webpack-upload-to-server-plugin

This webpack plugin aims to upload resources compiled by webpack to remote server.

#### Environment requirement
node >= 6 <br>
webpack >= 2 

#### Install
`npm insatll webpack-upload-to-server-plugin --save`

#### Usage
- In webpack.config.js

Add a plugin in the webpack.config.js.

```
const WebpackUploadPlugin = require('webpack-upload-to-server-plugin');

module.exports = {
    ...,
    plugins: [
        ...,
        new WebpackUploadPlugin({
            receiver: 'http://11.111.111.11:8080/upload',
            to: '/data/',
            rules: [{
                    test: /\.js$/,
                    path: 'static-h5/js/'
                },
                {
                    test: /\.html$/,
                    path: 'views/'
                },
                {
                    test: /\.css$/,
                    path: 'static-h5/css/'
                }
            ]
        }),
        ...
    ],
    ...
}
```
- server side

    1 - Create a file at the server side using the code in `server/index.js`.

    2 - Install the dependencies、choose a port and then start the node server.

    Note: The server side code depends on the `Express`. You can modify the server side code as you need.

#### Configuration

- `{string} receiver`： The server address.
- `{string} to`： The root path where the resources need to be placed.
- `{Array} rules`： The rules decide the destination of each type of resources. 

Notice that the final destination is the value of `to` param joining with the value of `path` param.<br>

Take the code above as an example, all of the `js` files will be placed
at `/data/static-h5/js` at the server `11.111.111.11`.<br>

So make sure the right configuration is been setted.







