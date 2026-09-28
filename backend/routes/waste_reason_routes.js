const express = require("express");
const router = express.Router();
const {
  list_waste_reasons,
  create_waste_reason,
  update_waste_reason,
  delete_waste_reason
} = require("../controllers/waste_reason_controller");
const require_login = require("../middleware/auth_middleware");
const allow_roles = require("../middleware/role_middleware");

router.get("/", require_login, list_waste_reasons);
router.post("/", require_login, allow_roles("admin"), create_waste_reason);
router.put("/:id", require_login, allow_roles("admin"), update_waste_reason);
router.delete("/:id", require_login, allow_roles("admin"), delete_waste_reason);

module.exports = router;
