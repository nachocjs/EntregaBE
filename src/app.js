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
import adminRouter from "./routes/admin.router.js";

import ProductService from "./services/ProductService.js";
import { authenticateJWT, ensureAuthenticated, ensureAdmin, errorHandler } from "./middlewares/auth.js";

dotenv.config();
await connectMongoDB();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const PORT = process.env.PORT || 8080;

const productService = new ProductService();

// --------------------
// Middlewares globales
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Inicializar Passport
app.use(passport.initialize());

// 🔹 Autenticar JWT desde cookie y pasar user a Handlebars
app.use(authenticateJWT);
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAdmin = req.user?.role === "admin";
  next();
});

// Archivos estáticos
app.use(express.static("public"));

// Configuración Handlebars con helpers
app.engine(
  "handlebars",
  engine({
    helpers: {
      eq: (a, b) => a === b,
      multiply: (a, b) => a * b,
      json: (context) => JSON.stringify(context, null, 2),
      ifEquals: (a, b, options) => (a === b ? options.fn(this) : options.inverse(this)), // ✅ helper agregado
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// --------------------
// Rutas
// --------------------
// Sesiones públicas
app.use("/api/sessions", sessionsRouter);

// Rutas protegidas con JWT
app.use("/api/products", ensureAuthenticated, productRouter);
app.use("/api/carts", ensureAuthenticated, cartRouter);

// Vistas
app.use("/", viewsRouter);

// Admin
app.use("/admin", adminRouter);

// --------------------
// WebSockets
// --------------------
io.on("connection", async (socket) => {
  try {
    const productsData = await productService.getProducts(100, 1);
    socket.emit("products", productsData.docs);

    socket.on("new-product", async (data) => {
      await productService.createProduct(data);
      const updatedProducts = await productService.getProducts(100, 1);
      io.emit("products", updatedProducts.docs);
    });

    socket.on("delete-product", async (id) => {
      try {
        await productService.deleteProduct(id);
        const updatedProducts = await productService.getProducts(100, 1);
        io.emit("products", updatedProducts.docs);
      } catch (error) {
        console.error("Error borrando producto:", error.message);
        socket.emit("error", { message: error.message });
      }
    });
  } catch (error) {
    console.error("Error en conexión WebSocket:", error);
  }
});

// Manejo de errores global
app.use(errorHandler);

// Servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});