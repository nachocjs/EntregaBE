import passport from "passport";
import local from "passport-local";
import JwtStrategy from "passport-jwt";
import User from "../models/User.model.js";

const LocalStrategy = local.Strategy;
const JWTStrategy = JwtStrategy.Strategy;
const ExtractJwt = JwtStrategy.ExtractJwt;

const SECRET_KEY = process.env.JWT_SECRET || "secretkey123";

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

// Estrategia Local para login (email + password)
passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }

        const valid = await user.isValidPassword(password);
        if (!valid) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Estrategia JWT para rutas protegidas
passport.use(
  "jwt",
  new JWTStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: SECRET_KEY,
    },
    async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id).populate("cart");
        if (!user) {
          return done(null, false, { message: "Token inválido" });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Estrategia 'current' para obtener usuario sin contraseña
passport.use(
  "current",
  new JWTStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: SECRET_KEY,
    },
    async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id).select("-password").populate("cart");
        if (!user) {
          return done(null, false, { message: "Token inválido" });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;