import mongoose from "mongoose";
import { ProductModel } from "./models/products.model.js";
import { logger } from "../utils/loggers.js";


/* try {
    await mongoose.connect(
      "mongodb+srv://santiagoberriolopez:mecanica95@cluster0.d1pj6rg.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce"
    );
    logger.info("DB Online");
  } catch (error) {
    logger.error(error)
  } */

  export class productMongoDAO{

    static async getPaginate(query,limite,pagina,sortOrder){
       return await ProductModel.paginate(
            query, // Aquí es donde van las condiciones de filtro, incluyendo 'category' si es necesario
            {
              lean: true,
              limit: limite,
              page: pagina,
              sort: sortOrder ? { price: sortOrder } : undefined,
            }
          );
    }

    static async get(){
     return ProductModel.findOne()
        .sort({ id: -1 })
        .limit(1)
        .lean();
    }

    static async getProduct(id){
      return ProductModel.findOne(id)
         .sort({ id: -1 })
         .limit(1)
         .lean();
     }

    static async create(id){
      const newProduct = new ProductModel(id);

      return await newProduct.save();

    }

    static async update(id,updatedFields){
     return  ProductModel.updateOne(
        { id: id },
        { $set: updatedFields })
    }

    static async delete(id){
      return ProductModel.deleteOne({ id: id });
    }
  }
    