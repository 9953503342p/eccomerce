const mongoose=require('mongoose')

const subcategorySchema=mongoose.Schema({
    categoryname:{type:String,},
    subcategoryname:{type:String,},
    subcategoryimage:{type:String,},
    subcategorydescription:{type:String},
})

const Sub=mongoose.model('Sub',subcategorySchema)
module.exports=Sub;