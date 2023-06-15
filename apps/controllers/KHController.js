var express = require("express");


const { ObjectId } = require("mongodb");
var router = express.Router();
var product = require("../models/KhachHang");
var khService = require("../services/khService");
//jwt
const jsonwebtoken = require("jsonwebtoken");
const jwtExpirySeconds = 300
var config = require('../../config/setting.json');
var verifyToken = require("../util/VerifyToken");
const KHService = require("../services/khService");

// Middleware to verify token and authorize user
var verifyTokenAndAuthorize = function(req, res, next) {
  try {
    const user = jsonwebtoken.verify(req.cookies.token, config.jwt.secret);
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).send('Unauthorized');
  }
};

router.get("/", function (req, res) {
    res.json({ "message": "this is NguoiDung page" });
});


router.get("/kh-list", async function(req,res){
  
    const khService = new KHService();
    const perPage = 5;
    const page = parseInt(req.query.page) || 1;
    const products = await khService.getProductList(page, perPage);
    const isAdmin = req.user && req.user.quyen === "admin";
    const totalProducts = await khService.getProductCount();
    const totalPages = Math.ceil(totalProducts / perPage);
    res.render("./admin/kh-list.ejs", {
      products: products,
      quyen: isAdmin,
      totalPages: totalPages,
      currentPage: page,
      activePage: '/kh-list'
    });
  
});


//them san pham
router.get("/add-kh", function(req,res){
  res.render("./admin/add-kh.ejs",{activePage: '/kh-list' });
});

router.post("/add-kh", async function(req, res){
  try {
    const khService = new KHService();
    const newProduct = new product();
    newProduct.hoTen = req.body.hoTen;
    newProduct.soDienThoai = req.body.soDienThoai;
    newProduct.taikhoan = req.body.taikhoan;
    newProduct.matKhau = req.body.matKhau;
    newProduct.diaChi = req.body.diaChi;
    newProduct.quyen = req.body.quyen;
    newProduct.GioiTinh = req.body.GioiTinh;
    newProduct.hinh = req.body.hinh;
    const result = await khService.insertProduct(newProduct);
    res.redirect("/kh/kh-list");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// phuong thuc sua


router.get("/edit/:id", async function(req,res){
  try {
    const khService = new KHService();
    const user = await khService.getUserById(req.params.id);
    res.render("./admin/edit-kh.ejs", { user: user,activePage: '/kh-list' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});


router.post("/edit/:id", async function(req,res){
  try {
    const khService = new KHService();
    const user = await khService.getUserById(req.params.id);
    user.hoTen = req.body.hoTen;
    user.soDienThoai = req.body.soDienThoai;
    user.taikhoan = req.body.taikhoan;
    user.matKhau = req.body.matKhau;
    user.diaChi = req.body.diaChi;
    user.quyen = req.body.quyen;
    user.GioiTinh = req.body.GioiTinh;
    user.hinh = req.body.hinh;
    const result = await khService.updateUser(user); // Corrected parameter
    res.redirect("/kh/kh-list");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});


// phương thức login



// phuong thuc xóa
router.post("/delete/:id", async function(req, res) {
  try {
    const khService = new KHService();
    const result = await khService.deleteProduct(req.params.id);
    res.redirect("/kh/kh-list");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});



module.exports = router;
