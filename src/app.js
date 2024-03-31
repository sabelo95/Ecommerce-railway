import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import { MessageModel } from "./dao/models/messages.model.js";
import sessions from 'express-session'
import mongoStore from 'connect-mongo'
import { inicializarPassport } from './config/config.passport.js';
import passport from 'passport';
import { config } from './config/config.js';
import { authUser } from "./utils/utils.js";
import { errorHandler } from './middlewares/errorHandler.js';
import { middLogg } from "./utils/loggers.js";
import { logger } from "./utils/loggers.js";
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import mongoose from "mongoose";

try {
  await mongoose.connect(
    "mongodb+srv://santiagoberriolopez:mecanica95@cluster0.d1pj6rg.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce"
  );
  logger.info("DB Online");
} catch (error) {
  logger.error(error)
}

const PORT = config.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();



const options={
  definition:{
      openapi:"3.0.0",
      info:{
          title: "API",
          version: "1.0.0",
          description: "Documentación API Eccomerce"
      }
  },
  apis: ["./src/docs/*.yaml"]
}

const specs=swaggerJsdoc(options)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))


app.use(sessions(
  {
      secret:config.SECRETKEY,
      resave: true, saveUninitialized: true,
      store: mongoStore.create(
          {
              mongoUrl:config.MONGO_URL,
              mongoOptions:{dbName:config.DBNAME},
              ttl:3600
          }
      )
  }
))

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

inicializarPassport()
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(path.join(__dirname, "/public")));

import productRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import realTimeProducts from "./routes/liveRouter.js";
import { router as vistasRouter } from './routes/vistas.router.js';
import { router as sessionRouter } from './routes/session.router.js';
import { router as mockingRouter } from "./routes/mocking.router.js";
import { router as loggerTest } from "./routes/loggerTets.router.js";
import { router as recovery } from "./routes/recovery.router.js";
import { router as users } from "./routes/users.router.js";

app.use(middLogg)
app.use("/api", productRouter);
app.get("/chat",authUser, (req, res) => {
  res.status(200).render("chat");
});

app.use("/api/carts", cartsRouter);
app.use(
  "/live",
  (req, res, next) => {
    req.io = io;
    next();
  },
  realTimeProducts
);

app.use('/', vistasRouter)
app.use('/api/sessions', sessionRouter)

app.use('/mockingProducts', mockingRouter)
app.use('/loggerTest',loggerTest)
app.use('/api/recovery', recovery)
app.use('/api/users', users)

app.use(errorHandler) 

const server = app.listen(PORT, () => {
  logger.info(`Server on line en puerto ${PORT}`);
});

const io = new Server(server);



let usuarios = [];
let mensajes = [];

io.on("connection", (socket) => {
  logger.info(`Se ha conectado un cliente con id ${socket.id}`);

  socket.on("id", async (nombre) => {
    usuarios.push({ nombre, id: socket.id });
    socket.broadcast.emit("nuevoUsuario", nombre);

    try {
      const mensajes = await MessageModel.find({}).lean();
      socket.emit("hello", mensajes);
    } catch (error) {
      console.error("Error al obtener mensajes de la base de datos:", error);
    }
  });

  socket.on("mensaje", async (datos) => {
    const nuevoMensaje = new MessageModel({
      messages: [{ user: datos.emisor, message: datos.mensaje }],
    });

    try {
      const mensajeGuardado = await nuevoMensaje.save();
      logger.info("Mensaje guardado en la base de datos:", mensajeGuardado);

      io.emit("nuevoMensaje", datos);
    } catch (error) {
      console.error("Error al guardar el mensaje en la base de datos:", error);
    }
  });

  socket.on("disconnect", () => {
    let usuario = usuarios.find((u) => u.id === socket.id);
    if (usuario) {
      io.emit("usuarioDesconectado", usuario.nombre);
    }
  });
});
