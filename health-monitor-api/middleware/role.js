// middleware/role.js
module.exports = function(role) {
    return (req, res, next) => {
      if (req.user.userType !== role) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }
      next();
    };
  };