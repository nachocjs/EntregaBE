import passport from "passport";
import local from "passport-local";
import JwtStrategy from "passport-jwt";
import User from "../models/User.model.js";

const LocalStrategy = local.Strategy;
const JWTStrategy = JwtStrategy.Strategy;
const ExtractJwt = JwtStrategy.ExtractJwt;
const SECRET_KEY = process.env.JWT_SECRET || "secretkey123";

const cookieExtractor = req => req?.cookies?.jwt || null;

// Local login
passport.use("login", new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: "Usuario no encontrado" });

      const valid = await user.isValidPassword(password);
      if (!valid) return done(null, false, { message: "Contraseña incorrecta" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// JWT strategy
passport.use("current", new JWTStrategy(
  { jwtFromRequest: cookieExtractor, secretOrKey: SECRET_KEY },
  async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).populate("cart").select("-password");
      if (!user) return done(null, false, { message: "Token inválido" });
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

export default passport;