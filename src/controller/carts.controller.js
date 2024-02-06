import { CartManager } from "../services/carts.services.js";
import { ManagerProduct } from "../services/products.services.js";

const cartManager = new CartManager();
const productManager = new ManagerProduct()
export class cartsController {
  constructor() {}

  static async postCarts(req, res) {
    /* const newCart = cartManager.createCart();
        res.status(201).json(newCart); */
    try {
      const newCart = await cartManager.createCart();
      res.status(201).json(newCart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear el carrito" });
    }
  }

  static async getOneCart(req, res) {
    let id = req.params.cid;

    try {
      const resultado = await cartManager.getCart(id);
      

      if (!resultado) {
        res.status(404).json("Carrito no encontrado");
      } else {
        res.setHeader("Content-Type", "text/html");
        res.status(200).render("carrito", { resultado,id });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener el carrito" });
    }
  }

  static async postProductOnCart(req, res) {
    let productId = req.params.pid;
    let id = req.params.cid;

    try {
      if (await cartManager.addProductToCart(id, productId)) {
        res
          .status(200)
          .json({ message: "Producto agregado al carrito con éxito" });
      } else {
        res.status(404).json({ error: "Carrito no encontrado" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Error al agregar el producto al carrito " });
    }
  }

  static async postProductOnCartAct(req, res) {
    const productId = req.params.pid;
    let id = req.params.cid;

    const newQuantity = req.body.quantity;
    console.log(newQuantity);

    try {
      if (newQuantity !== undefined && newQuantity !== null) {
        // Actualiza la cantidad del producto en el carrito
        if (
          await cartManager.updateProductQuantityInCart(
            id,
            productId,
            newQuantity
          )
        ) {
          res
            .status(200)
            .json({ message: "Cantidad del producto actualizada con éxito" });
        } else {
          res
            .status(404)
            .json({ error: "Producto no encontrado en el carrito" });
        }
      } else {
        res
          .status(400)
          .json({ error: "La cantidad del producto no se proporcionó" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al procesar la solicitud" });
    }
  }

  static async deleteCart(req, res) {
    let productId = req.params.pid;
    let id = req.params.cid;
    id = parseInt(id);

    if (isNaN(id)) {
      return res.send("Error, ingrese un argumento id numerico");
    }

    try {
      if (await cartManager.removeProductFromCart(id, productId)) {
        res.status(200).json({ message: "Producto eliminado con exito" });
      } else {
        res.status(404).json({ error: "Carrito no encontrado" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al eliminar el producto" });
    }
  }

  static async generateTicket(req, res) {
   
    try {
      let carUsuario=req.user.car
      let carrito=await cartManager.getCart(carUsuario)
     let nostock= await  productManager.updateProductQuantities(carrito)
     res.status(200).json({ payload: 'ticket generado, gracias por tu compra :), estos son los productos que no tienen inventario',nostock });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "error" });
    }
  }
}
