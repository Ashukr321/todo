import express from 'express';

import helmet from 'helmet';
import connectDb from './config/connectDatabase.js';
import cors from 'cors';
import globalErrorHandler from './middleware/globalErrorHandler.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize'
import fs from 'fs';
import configEnv from './config/configEnv.js';
//  import routes 
import userRoutes from './routes/userRoutes.js'
import taskRoutes from './routes/taskRoutes.js'



// Create an express app
const app = express();

//get logs in development mode
if(configEnv.node_env=="production"){
  const logStream = fs.createWriteStream('access.log', { flags: 'a' });
  app.use(morgan('dev', { stream: logStream }));
}



app.use(helmet());
app.use(cookieParser());

app.use(cors({
  origin: '*',
  credentials: true,
}))
// server static file 
app.use(express.static('./public'));

// Connect to the database
await connectDb();

app.use(express.json({limit:"10kb"})); 

// data sanitization against nql-sql query attack
app.use(mongoSanitize());



// Routes 
//  useRoutes
const base = "/api/v1"
app.use(`${base}/user`,userRoutes);
app.use(`${base}/task`,taskRoutes);

//  error handling middleware
app.use(globalErrorHandler);
// Define the port
// process is the global object 
const port = configEnv.port || 3000;

// Start the server
app.listen(port,  () => {
  console.log(`Server is running on port ${port}`);
});

// Export the app
export default app;