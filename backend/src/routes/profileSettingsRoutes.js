const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const {protect} = require("../middleware/authMiddleware");
const {updatePassword,updateBusiness} = require("../controllers/profileSettingController")
const {
  updateProfileSetting,
} = require("../controllers/profileSettingController");
router.put('/update_password/:id', protect, updatePassword);
router.put(
  "/update_business/:id",
  protect,
updateBusiness
);
router.put(
  "/profile/:id",
  protect,
  upload.single("avatar"),
  updateProfileSetting
);


module.exports = router;