const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const hasRole = roles.includes(req.user.role);
        if (!hasRole) {
            res.redirect('/login');
            return;
        }

        next();
    };
};

module.exports = checkRole;