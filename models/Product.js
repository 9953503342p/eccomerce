const mongoose=require('mongoose')

const ProductcategorySchema=mongoose.Schema({
    categoryname:{type:String,},
    subcategoryname:{type:String,},
    companyname:{type:String},
    Productname:{type:String,},
    Productnamedescription:{type:String},
    Productimage:{type:String},
    Productprice:{type:String}
})

const Product=mongoose.model('Product',ProductcategorySchema)
module.exports=Product;