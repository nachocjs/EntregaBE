import express from "express";
import { engine } from "express-handlebars";
import { Server as SocketIOServer } from "socket.io";
import http from "http";

import productRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";
import viewsRouter from "./routes/views.router.js";

import ProductManager from "./ProductManager.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const productManager = new ProductManager("./src/products.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Handlebars setup
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewsRouter);

// WebSocket
io.on("connection", async (socket) => {
  const products = await productManager.getProducts();
  socket.emit("products", products);

  socket.on("new-product", async (data) => {
    await productManager.addProduct(data);
    const updatedProducts = await productManager.getProducts();
    io.emit("products", updatedProducts);
  });

 socket.on("delete-product", async (id) => {
  
  try {
    const updatedList = await productManager.deleteProductById(id);
    const updatedProducts = await productManager.getProducts();
    io.emit("products", updatedProducts);
  } catch (error) {
    console.error("Error borrando producto:", error.message);
    socket.emit("error", { message: error.message });
  }
});
});

// Start server
server.listen(8080, () => {
  console.log("Servidor activo en http://localhost:8080");
});