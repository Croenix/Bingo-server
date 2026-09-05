const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({name:{type:String,required:true,trim:true,minlength:1,maxlength:100},gmailId:{type:String,required:true,unique:true,lowercase:true,trim:true,maxlength:254,match:/^[a-zA-Z0-9._%+-]+@gmail\.com$/}},{timestamps:true});
module.exports=mongoose.model('User',userSchema);
