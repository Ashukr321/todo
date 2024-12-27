import mongoose, { mongo } from "mongoose";

const taskSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true,
  },
  description:{
    type:String,
    required:true,
  },
  status:{
    type:String,
    enum:["active", "completed","pending"],
  },

  // create relation with user model
  createdBy:{
    type:mongoose.Types.ObjectId,
    ref:"User",
    required:true,
  },
  
},{
  timestamps:true,
})


const Task = mongoose.model("Task",taskSchema);

export default Task;