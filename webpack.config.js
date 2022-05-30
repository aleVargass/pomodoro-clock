const path = require("path");

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "public")
    },
    mode: "development",
    module: {
        rules: [{
            loader: "babel-loader",
            test: /\.js$/,
            exclude: /node_modules/
        },
        {
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
        }]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "public")
        }
    }
}