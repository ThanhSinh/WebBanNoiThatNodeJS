var express = require("express");


const { ObjectId } = require("mongodb");
var router = express.Router();
var giohang = require("../models/GioHang");
var ctgiohang = require("../models/CTGioHang");
var giohangService = require("../services/giohangService");
var product = require("../models/KhachHang");
var khService = require("../services/khService");
//jwt
const jsonwebtoken = require("jsonwebtoken");
const jwtExpirySeconds = 300
var config = require('../../config/setting.json');
var verifyToken = require("../util/VerifyToken");
const GiohangService = require("../services/giohangService");
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


router.get("/cart-list", async function(req,res){
    const giohangService = new GiohangService();
    const perPage = 5;
    const page = parseInt(req.query.page) || 1;
    const products = await giohangService.getProductList(page, perPage);
    const KHs = await giohangService.getKH();
    const totalProducts = await giohangService.getProductCount();
    const totalPages = Math.ceil(totalProducts / perPage);
    for (let i = 0; i < products.length; i++) {
        const KH = KHs.find(pt => pt._id.toString() === products[i].KhachHang_id);
        const tenKH = KH ? KH.hoTen : '';
        products[i].tenKH = tenKH;
    }    
    
    res.render("./admin/cart-list.ejs", {
       
      products: products,
      totalPages: totalPages,
      currentPage: page,
      activePage: '/cart-list'
    });
  
});


router.get("/cart-detail/:id", async function(req, res) {
  const giohangService = new GiohangService();
  const id = req.params.id;
  const giohang = await giohangService.getProductById(id);
  const ctsanphams = await giohangService.getCTGioHangByGioHangId(id);
  const sanphams = await Promise.all(ctsanphams.map(async (ctsp) => {
    const sanpham = await giohangService.getSanPhamById(ctsp.SP_id);
    return {
      TenSP: sanpham.TenSP,
      Gia: sanpham.Gia,
      SoLuong: ctsp.SoLuong,
     
    };
  }));
  res.render("./admin/cart-detail.ejs", {
    giohang: giohang,
    ctsanphams: ctsanphams,
    sanphams: sanphams,
    activePage: '/cart-list'
  });
});




module.exports = router;
