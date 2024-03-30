 import dotenv from 'dotenv'

dotenv.config(
    {
        override: true,
        path:"./src/.env"
    }
) 

export const config={
    MONGO_URL:process.env.MONGO_URL, 
    DBNAME:process.env.DBNAME,
    CALLBACK_URL:process.env.CALLBACK_URL,
    CLIENT_ID:process.env.CLIENT_ID,
    CLIENT_SECRET:process.env.CLIENTSECRET,
    SecretKey:process.env.SECRETKEY,
    MODE:process.env.MODE||"production"


}