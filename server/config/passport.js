const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Error deserializing user:', err);
    done(err, null);
  }
});

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, email, password, done) => {
    try {
      console.log('Attempting login for email:', email);
      console.log('Request body:', req.body);
      
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.log('User not found:', email);
        return done(null, false, { message: 'Ungültige E-Mail oder Passwort' });
      }

      console.log('User found:', {
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      });

      const isMatch = await user.comparePassword(password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        console.log('Password does not match');
        return done(null, false, { message: 'Ungültige E-Mail oder Passwort' });
      }

      console.log('Login successful, updating last login');
      user.lastLogin = new Date();
      await user.save();

      console.log('Login successful for:', email);
      return done(null, user);
    } catch (err) {
      console.error('Error in Local Strategy:', err);
      return done(err);
    }
  }
));

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://192.168.178.129:5000'}/auth/google/callback`,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth Profile:', JSON.stringify(profile, null, 2));

        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          console.error('No email provided by Google');
          return done(new Error('No email provided by Google'), null);
        }

        const email = profile.emails[0].value.toLowerCase();

        // First try to find by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If not found by googleId, try by email
          user = await User.findOne({ email });
        }

        if (user) {
          // Update existing user
          user.googleId = profile.id;
          user.name = profile.displayName;
          user.picture = profile.photos?.[0]?.value || user.picture;
          user.lastLogin = new Date();
          
          await user.save();
          console.log('Updated existing user:', user);
          return done(null, user);
        }

        // Create new user
        const newUser = await User.create({
          googleId: profile.id,
          email: email,
          name: profile.displayName,
          picture: profile.photos?.[0]?.value,
          role: 'volunteer',
          lastLogin: new Date()
        });

        console.log('Created new user:', newUser);
        return done(null, newUser);
      } catch (err) {
        console.error('Error in Google Strategy:', err);
        return done(err, null);
      }
    }
  )
);
