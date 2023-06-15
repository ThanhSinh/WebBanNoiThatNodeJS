//khai báo module sử dụng trong đồ án
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
//cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser())
//sử dụng express json để post các dữ liệu dưới dạng json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
var controller = require(__dirname + "/apps/controllers");
app.use(controller);
//chỉ đường dẫn tới views để lấy các file .ejs
app.set("views",__dirname + "/apps/views");
app.set("view engine", "ejs");
//chỉ đường dẫn tới public để lấy các file trong css và js
app.use("/public", express.static(__dirname + "/public"));
var server = app.listen(3000, function(){
    console.log("server is running");
});