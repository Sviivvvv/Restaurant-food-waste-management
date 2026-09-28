const express = require("express");
const router = express.Router();
const { list_users, create_user, update_user, deactivate_user } = require("../controllers/user_controller");
const require_login = require("../middleware/auth_middleware");
const allow_roles = require("../middleware/role_middleware");

// every route here is admin only, since only admins manage user accounts
router.use(require_login, allow_roles("admin"));

router.get("/", list_users);
router.post("/", create_user);
router.put("/:id", update_user);
router.patch("/:id/deactivate", deactivate_user);

module.exports = router;
