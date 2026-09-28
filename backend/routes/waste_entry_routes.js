const express = require("express");
const router = express.Router();
const {
  create_waste_entry,
  list_my_entries,
  list_all_entries,
  update_my_entry
} = require("../controllers/waste_entry_controller");
const require_login = require("../middleware/auth_middleware");
const allow_roles = require("../middleware/role_middleware");

router.use(require_login);

router.post("/", create_waste_entry);
router.get("/mine", list_my_entries);
router.put("/mine/:id", update_my_entry);
router.get("/", allow_roles("manager", "admin"), list_all_entries);

module.exports = router;
