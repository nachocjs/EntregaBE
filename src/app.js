import express from "express";
import { engine } from "express-handlebars";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import connectMongoDB from "./config/db.js";

import productRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";
import viewsRouter from "./routes/views.router.js";
import sessionsRouter from "./routes/sessions.router.js";

import Product from "./models/Product.model.js";
import {
  authenticateJWT,
  ensureAuthenticated,
  ensureAdmin,
  errorHandler,
} from "./middlewares/auth.js";

dotenv.config();
await connectMongoDB();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport middlewares 
app.use(passport.initialize());

// JWT auth para todas las rutas
app.use(authenticateJWT);

// Middleware para pasar usuario autenticado a las vistas
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAdmin = req.user?.role === "admin";
  next();
});

// Static files
app.use(express.static("public"));

// Handlebars config
app.engine(
  "handlebars",
  engine({
    helpers: {
      eq: (a, b) => a === b,
      multiply: (a, b) => a * b,
      json: (context) => JSON.stringify(context, null, 2),
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);

// WebSocket
io.on("connection", async (socket) => {
  try {
    const products = await Product.find().lean();
    socket.emit("products", products);

    socket.on("new-product", async (data) => {
      const newProduct = new Product(data);
      await newProduct.save();

      const updatedProducts = await Product.find().lean();
      io.emit("products", updatedProducts);
    });

    socket.on("delete-product", async (id) => {
      try {
        await Product.findByIdAndDelete(id);
        const updatedProducts = await Product.find().lean();
        io.emit("products", updatedProducts);
      } catch (error) {
        console.error("Error borrando producto:", error.message);
        socket.emit("error", { message: error.message });
      }
    });
  } catch (error) {
    console.error("Error en conexión WebSocket:", error);
  }
});

// Error handler global
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});