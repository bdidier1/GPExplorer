// helper utilisé par le guard router et les tests
// retourne true si l'accès est autorisé
export function checkAccess(path, isAuthenticated, role) {
  // normalise le path sans query hash ni slash final
  const clean = (path || '').split('?')[0].split('#')[0].replace(/\/+$/g, '')
  
  // récupère le premier segment de route
  const firstSegment = '/' + (clean.split('/')[1] || '')
  
  // routes protégées par rôle
  const needsUser = firstSegment === '/user'
  const needsProvider = firstSegment === '/provider'  // /provider/* seulement
  const needsAdmin = firstSegment === '/admin'
  
  // /providers est public et différent de /provider
  // routes publiques sans segment protégé
  if (!needsUser && !needsProvider && !needsAdmin) return true

  // l'admin organizer a accès à tout
  if (isAuthenticated && role === 'organizer') return true

  // les sections protégées demandent une auth
  if (!isAuthenticated) return false

  // vérifie les rôles user et provider
  if ((needsUser && role === 'user') ||
      (needsProvider && role === 'provider')) {
    return true
  }

  return false
}
