const express = require("express");
const router = express.Router();
const { list_categories, create_category, update_category, delete_category } = require("../controllers/category_controller");
const require_login = require("../middleware/auth_middleware");
const allow_roles = require("../middleware/role_middleware");

router.get("/", require_login, list_categories);
router.post("/", require_login, allow_roles("admin"), create_category);
router.put("/:id", require_login, allow_roles("admin"), update_category);
router.delete("/:id", require_login, allow_roles("admin"), delete_category);

module.exports = router;
