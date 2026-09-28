const express = require("express");
const router = express.Router();
const { login, get_current_user } = require("../controllers/auth_controller");
const require_login = require("../middleware/auth_middleware");

router.post("/login", login);
router.get("/me", require_login, get_current_user);

module.exports = router;
