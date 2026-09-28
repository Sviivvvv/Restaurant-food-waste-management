// Restricts a route to only the roles listed, for example allow_roles("manager", "admin")
function allow_roles(...allowed_roles) {
  return function check_role(req, res, next) {
    if (!req.user || !allowed_roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do this" });
    }
    next();
  };
}

module.exports = allow_roles;
