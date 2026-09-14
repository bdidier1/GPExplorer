function isProvider(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ 
            error: 1, 
            message: "Non autorisé. Veuillez vous connecter." 
        });
    }
    
    if (req.user.role !== 'provider' && req.user.role !== 'organizer') {
        return res.status(403).json({ 
            error: 1, 
            message: "Accès refusé. Rôle prestataire requis." 
        });
    }
    
    next();
}

function isOrganizer(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ 
            error: 1, 
            message: "Non autorisé. Veuillez vous connecter." 
        });
    }
    
    if (req.user.role !== 'organizer') {
        return res.status(403).json({ 
            error: 1, 
            message: "Accès refusé. Rôle organisateur requis." 
        });
    }
    
    next();
}

function hasRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 1, 
                message: "Non autorisé. Veuillez vous connecter." 
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 1, 
                message: `Accès refusé. Rôle(s) requis: ${roles.join(', ')}` 
            });
        }
        
        next();
    };
}

export { isProvider, isOrganizer, hasRole };

