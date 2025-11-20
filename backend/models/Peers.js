import mongoose from "mongoose";
const Peers = new mongoose.Schema({
  name:String, 
  ip:String, 
  port:Number, 
  psk:String, 
  isActive:Boolean
});
export default mongoose.model('Peers', Peers);
