const express = require("express");
const router = express.Router();
const { list_branches, create_branch, update_branch } = require("../controllers/branch_controller");
const require_login = require("../middleware/auth_middleware");
const allow_roles = require("../middleware/role_middleware");

router.get("/", require_login, list_branches);
router.post("/", require_login, allow_roles("admin"), create_branch);
router.put("/:id", require_login, allow_roles("admin"), update_branch);

module.exports = router;
