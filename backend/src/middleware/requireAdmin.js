const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const token = req.cookies?.jwt_token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Solo administradores' });
    }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
}

module.exports = requireAdmin;
