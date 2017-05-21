import bcrypt from 'bcryptjs'
import authenticationMiddleware from './middleware'

function initPassport (app, passport, options) {
  const {db} = options

  const LocalStrategy = require('passport-local').Strategy
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })
  
  passport.deserializeUser(function (user, done) {
    db.one('select * from users where id = $1', user)
    .then(function (data) {
      return done(null, data)
    })
    .catch(function (err) {
      return done(err)
    })
  })
  
  passport.use(new LocalStrategy(
    function (username, password, done) {
      db.one('select * from users where username = $1', username)
      .then(function (user) {
        if (!user) { return done(null, false) }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false)
        }
        return done(null, user)
      })
      .catch(function (err) {
        return done(err)
      })
    })
  )
  
  passport.authenticationMiddleware = authenticationMiddleware
  
}

export default initPassport