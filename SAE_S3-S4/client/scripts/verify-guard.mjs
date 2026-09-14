import assert from 'node:assert/strict'
import { checkAccess } from '../src/router/guardUtils.js'

function run() {
  const cases = []

  // Public route should be allowed regardless of auth
  cases.push(['public no auth', checkAccess('/', false, undefined) === true])
  cases.push(['public auth user', checkAccess('/', true, 'user') === true])

  // Not authenticated should be blocked for protected prefixes
  cases.push(['user/home no auth', checkAccess('/user/home', false, undefined) === false])
  cases.push(['provider/home no auth', checkAccess('/provider/home', false, undefined) === false])
  cases.push(['admin/home no auth', checkAccess('/admin/home', false, undefined) === false])

  // Authenticated role-specific
  cases.push(['user role on user path', checkAccess('/user/home', true, 'user') === true])
  cases.push(['user role on provider path', checkAccess('/provider/home', true, 'user') === false])
  cases.push(['user role on admin path', checkAccess('/admin/home', true, 'user') === false])

  cases.push(['provider role on provider path', checkAccess('/provider/home', true, 'provider') === true])
  cases.push(['provider role on user path', checkAccess('/user/home', true, 'provider') === false])
  cases.push(['provider role on admin path', checkAccess('/admin/home', true, 'provider') === false])

  cases.push(['organizer role on admin path', checkAccess('/admin/home', true, 'organizer') === true])
  cases.push(['organizer role on user path', checkAccess('/user/home', true, 'organizer') === true])
  cases.push(['organizer role on provider path', checkAccess('/provider/home', true, 'organizer') === true])

  // Test /providers vs /provider distinction
  cases.push(['public access to /providers', checkAccess('/providers', false, undefined) === true])
  cases.push(['user access to /providers', checkAccess('/providers', true, 'user') === true])
  cases.push(['provider blocked from /user', checkAccess('/user/home', true, 'provider') === false])
  cases.push(['user blocked from /provider', checkAccess('/provider/home', true, 'user') === false])

  let pass = 0
  for (const [name, ok] of cases) {
    if (!ok) {
      console.error('FAIL:', name)
      process.exitCode = 1
    } else {
      console.log('PASS:', name)
      pass++
    }
  }
  console.log(`\nSummary: ${pass}/${cases.length} checks passed`)
}

run()
