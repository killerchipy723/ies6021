// middleware.js
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); // La sesión es válida, continuar con la solicitud
    } else {
        res.redirect('/login.html'); // Redirigir a la página de login si no está autenticado
    }
}

module.exports = { isAuthenticated };