import express from 'express';
const router = express.Router();
import protect from '../middleware/protectRouteHandler.js';
import rateLimiter from '../middleware/rateLimiter.js';
import { createTask,getTasks,updateTask,deleteTask,deleteAllTasks } from '../controllers/taskController.js';



// create task 
router.post('/createTask',protect,rateLimiter,createTask);
router.get('/allTasks',protect,getTasks);
router.put('/update/:productId',protect,updateTask);
router.delete('/delete/:taskId',protect,deleteTask);
router.delete('/deleteTasks',protect,deleteAllTasks);



export default router;