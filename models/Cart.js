
const mongoose=require('mongoose')

const CartSchema=mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }
},{timestamps:true})

CartSchema.index({ userId: 1, productId: 1 }, { unique: false });
module.exports=mongoose.model('Cart',CartSchema)