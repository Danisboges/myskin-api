const express = require("express");
const userManagementController = require("../controllers/userManagement.controller");
const { verifyToken, isAdmin, isAdminOrDoctor } = require("../middlewares/auth.middleware");
// const authController = require("../controllers/auth.controller");

const router = express.Router();


router.use(verifyToken);

router.get("/management/", isAdmin, userManagementController.fetchAllUsers);
router.get("/management/:id",isAdmin, userManagementController.fetchUserDetail);
router.put("/management/:id", isAdmin, userManagementController.updateUser);
router.delete("/management/:id", isAdmin, userManagementController.removeUser);
// router.get("/patients", isAdminOrDoctor, userManagementController.fetchAllPatients);
router.get("/patients", isAdminOrDoctor, userManagementController.fetchAllPatients);
router.get("/doctors", isAdmin, userManagementController.fetchAllDoctors);

module.exports = router;