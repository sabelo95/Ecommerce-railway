import mongoose from "mongoose";
import { CartModel } from "../dao/models/carts.model.js";
import { logger } from "../utils/loggers.js";

/* try {
    await mongoose.connect(
      "mongodb+srv://santiagoberriolopez:mecanica95@cluster0.d1pj6rg.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce"
    );
    logger.info("DB Online");
  } catch (error) {
    logger.error(error);
  } */


  export class cartMongoDAO{
    

   static async get(){
        return  CartModel.find()
    }

   static async create(id,user){
        
  
        const newCart = new CartModel({ id: id, products: [], user: user });

        await newCart.save();
  
        return newCart;
    }

     static async getCart(cartId){
        const cart = await CartModel.findOne({ _id: cartId })
        .populate("products.product")
        .lean();
        
      return cart;
    }

    static async addProduct(cartId,productId){

        const cart = await CartModel.findOne({ _id:cartId });

      if (!cart) {
        throw new Error("Carrito no encontrado");
      }

      const existingProductIndex = cart.products.findIndex((product) =>
        product.product.equals(productId)
      );

      if (existingProductIndex !== -1) {
        cart.products[existingProductIndex].quantity =
          (cart.products[existingProductIndex].quantity || 0) + 1;
       
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      await cart.save();

    }

    static async deleteProduct(cartId, productId){
      const cart = await CartModel.findOneAndUpdate(
        { id: cartId, "products.product": productId },
        { $pull: { products: { product: productId } } },
        { new: true }
      );

      if (cart) {
        return true;
      } else {
        throw new Error("Producto no encontrado en el carrito");
      }
    }

    static async updateProduct(cartId,productId,newQuantity){
      const cart = await CartModel.findOneAndUpdate(
        { id: cartId, "products.product": productId },
        { $set: { "products.$.quantity": newQuantity } },
        { new: true }
      );

      if (cart) {
        return true;
      } else {
        throw new Error("Producto no encontrado en el carrito");
      }
    }

    static async updateOne(cartId,products){
      await CartModel.updateOne({ _id: cartId }, { products: products })
    }
}