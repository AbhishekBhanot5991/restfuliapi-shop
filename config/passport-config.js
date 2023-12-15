const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user'); // Adjust the path if needed

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ email: username });

        if (!user || !user.validPassword(password)) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
