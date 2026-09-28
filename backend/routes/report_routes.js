const express = require("express");
const router = express.Router();
const { get_summary, get_top_items, get_trends } = require("../controllers/report_controller");
const require_login = require("../middleware/auth_middleware");
const allow_roles = require("../middleware/role_middleware");

router.use(require_login, allow_roles("manager", "admin"));

router.get("/summary", get_summary);
router.get("/top-items", get_top_items);
router.get("/trends", get_trends);

module.exports = router;
