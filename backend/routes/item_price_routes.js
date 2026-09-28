const express = require("express");
const router = express.Router();
const {
  list_item_prices,
  create_item_price,
  update_item_price,
  delete_item_price
} = require("../controllers/item_price_controller");
const require_login = require("../middleware/auth_middleware");
const allow_roles = require("../middleware/role_middleware");

router.get("/", require_login, list_item_prices);
router.post("/", require_login, allow_roles("manager", "admin"), create_item_price);
router.put("/:id", require_login, allow_roles("manager", "admin"), update_item_price);
router.delete("/:id", require_login, allow_roles("manager", "admin"), delete_item_price);

module.exports = router;
