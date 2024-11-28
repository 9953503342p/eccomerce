const mongoose=require('mongoose')

const CategorySchema=mongoose.Schema({
    name:{type:String,},
    Image:{type:String,},
    description:{type:String,}
})

const Category=mongoose.model('Category',CategorySchema)
module.exports=Category;