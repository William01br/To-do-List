import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import userService from "../services/userService.js";
import authService from "../services/authService.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (acessToken, refreshToken, profile, done) => {
      try {
        console.log(profile.id);
        let user = await userService.findUserByOauthId(profile.id);
        console.log(user);

        if (!user || user.length === 0) {
          user = await userService.registerByOAuth({
            oauthId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
          });
        }
        console.log(profile.id, profile.displayName, user.id);

        console.log(user);

        const tokens = await authService.getTokens(user.id);
        console.log(tokens);

        done(null, { user, tokens });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(user.oauthId);
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  await userService.findUserByOauthId(id, (err, user) => {
    done(err, user);
  });
});
