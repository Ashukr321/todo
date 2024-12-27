import { config } from 'dotenv';
config();
const configEnv = {
  port: process.env.PORT,
  mongo_url: process.env.MONGO_URL,
  db_name: process.env.DB_NAME,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expiry: process.env.JWT_EXPIRY,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  cookies_expire: process.env.COOKIES_EXPIRE,
  node_env: process.env.NODE_ENV,
  smtp_email:process.env.SMTP_EMAIL,
  smtp_password:process.env.SMTP_PASSWORD,
}

export default configEnv

