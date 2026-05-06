const express = require('express');
const router = express.Router();

// Gunakan kurung kurawal { } untuk mengambil fungsi spesifik
const { verifyToken } = require('../middlewares/auth.middleware'); 
const upload = require('../middlewares/upload.middleware');
const detectionController = require('../controllers/detection.controller');

// Sekarang gunakan verifyToken di sini
router.post("/", verifyToken, upload.single("image"), detectionController.predict);

module.exports = router;