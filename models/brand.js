const mongoose=require('mongoose')

const brandSchema=mongoose.Schema({
    categoryname:{type:String,},
    subcategoryname:{type:String,},
    companyname:{type:String,},
    companydescription:{type:String},
    companyimage:{type:String}
})

const Brand=mongoose.model('Brand',brandSchema)
module.exports=Brand;