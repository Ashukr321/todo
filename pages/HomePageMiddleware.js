import path from "path"
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HomePageMiddleware = (req,res)=>{
    res.sendFile(path.join(__dirname,"../public/home.html"))
}

export default HomePageMiddleware;