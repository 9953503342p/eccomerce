const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
const Razorpay = require('razorpay');
const Payment = require('./models/Payment'); // Import the schema
const mongoose = require('mongoose');
const session = require('express-session');
const Category=require('./models/Categoryschema')
const multer = require('multer');
const path = require('path');
const User = require('./models/Userschema'); // Make sure the model is defined correctly
const Sub =require('./models/subcategory')
const Brand=require('./models/brand')
const { profile } = require('console');
const Cart = require('./models/Cart');
const Product=require('./models/Product')

const app = express();
const port = 5000;      

// Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
    secret: 'your-secret-key', // Replace with your secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false // Set to true if using HTTPS
    }
}));
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'uploads'), // Save files in the uploads folder within your project
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
const storage2 = multer.diskStorage({
    destination: path.join(__dirname, 'uploads/sub'), // Save files in the uploads folder within your project
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload2 = multer({ storage:storage2 });

const storage3 = multer.diskStorage({
    destination: path.join(__dirname, 'uploads/com'), // Save files in the uploads folder within your project
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload3 = multer({ storage:storage3 });

const storage4 = multer.diskStorage({
    destination: path.join(__dirname, 'uploads/Product'), // Save files in the uploads folder within your project
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload4 = multer({ storage:storage4 });


const storage1=multer.diskStorage({
    destination: path.join(__dirname,'uploads/profile'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})


const upload1=multer({storage:storage1})
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/signups')
    .then(() => console.log('MongoDB is connected'))
    .catch((err) => console.log(err));

// User Registration
app.post('/post', async (req, res) => {
    const { name, email, password, mobile } = req.body;

    try {
        const emailExist = await User.findOne({ email });
        if (emailExist) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const userData = new User({
            name,
            email,
            password, // Store the password as plain text (not recommended)
            mobile,
        });

        await userData.save(); 
        console.log('Registration is successful');
        return res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            if (user.password === password) { // Compare password as plain text
                // Set session before sending the response
                req.session.user = {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    mobile: user.mobile,
                    profileImage:user.profileImage
                    
                };
                
                return res.status(200).json({ message: 'Login successful', Username: req.session.user });
            } else {
                return res.status(400).json({ message: 'Invalid password' });
            }
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

app.get('/edit-profile/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (user) {
            res.status(200).json(user); 
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/edit-profile/:id', upload1.single('profileImage'), async (req, res) => {
    const { name, email, password, mobile } = req.body;

    try {
        const updateData = { name, email, password, mobile };
        
        if (req.file) {
            updateData.profileImage = path.join('uploads/profile', req.file.filename); // Relative path
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (updatedUser) {
            req.session.user = {
                id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
                mobile: updatedUser.mobile,
                profileImage: updatedUser.profileImage
            };
            return res.status(200).json({ message: 'Profile updated successfully', user: req.session.user });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


 
app.get('/add-category', async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch all categories
        res.render('category', { data: categories }); // Render the category view without the leading slash
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/category-data',async (req,res)=>{
    try{
        const data=await Category.find();
        res.status(201).json({data})
    }
    catch(err){
        res.send(err)
    }
})



app.post('/category', upload.single('Image'), async (req, res) => {
    const { name, description } = req.body;

    try {
        if (!req.file) {
            console.log('No file uploaded.');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newCategory = new Category({
            name,
            description,
            Image: path.join('uploads', req.file.filename)  
        });

        await newCategory.save();
        console.log('Category saved:', newCategory);
        res.redirect('/add-category');
    } catch (err) {
        console.error('Error saving category:', err);
        return res.status(500).json({ message: 'Error saving category' });
    }
});



app.get('/sub-category', async (req, res) => {
    try {
        const categories = await Category.find(); 
        const subcategories = await Sub.find();   

        res.render('subcategory', {
            categories: categories,
            subcategories: subcategories
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send("An error occurred while fetching data");
    }
});


app.post('/subcategory', upload2.single('subcategoryimage'), async (req, res) => {
    const { subcategorydescription, subcategoryname, categoryname } = req.body;

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newSubcategory = new Sub({
            subcategorydescription,
            subcategoryname,
            categoryname,
            subcategoryimage: path.join('uploads/sub', req.file.filename)
        });

        await newSubcategory.save();
        res.redirect('/sub-category')
       
    } catch (err) {
 
        console.log(err) // Passes error to the middleware
    }
});

// Edit Route
app.get('/subcategory/edit/:id', async (req, res) => {
    const subcategory = await Sub.findById(req.params.id);
    const categories = await Category.find();
    if (subcategory) {
        res.render('editsSubcategory', { subcategory,categories });
    } else {
        res.status(404).send("Subcategory not found");
    }
});

app.post('/subcategory/edit/:id', async (req, res) => {
    try {
        const updateData = {
            categoryname: req.body.categoryname,
            subcategoryname: req.body.subcategoryname,
            subcategorydescription: req.body.subcategorydescription,
        };
        
        if (req.file) {
            updateData.subcategoryImage = req.file.path; // Assuming file upload middleware saves path to `req.file.path`
        }

        await Sub.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/sub-category'); // Redirect to the main subcategory page
    } catch (error) {
        console.error('Error updating subcategory:', error);
        res.status(500).send("An error occurred while updating the subcategory");
    }
});

app.get('/brand',async(req,res)=>{
    try {
        const categories = await Category.find(); 
        const subcategories = await Sub.find(); 
        const brand=await Brand.find();  

        res.render('Brand', {
            categories: categories,
            subcategories: subcategories,
            Brand:brand,
            message:''
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send("An error occurred while fetching data");
    }
})

app.post('/subcategory/delete/:id', async (req, res) => {
    try {
        await Sub.findByIdAndDelete(req.params.id);
        res.redirect('/sub-category'); 
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).send("An error occurred while deleting the subcategory");
    }
});

app.get('/category/:categoryName/', async (req, res) => {
    const { categoryName } = req.params;
    try {
        const subcategories = await Sub.find({ categoryname: categoryName });
        res.json({ subcategories });
    } catch (err) {
        console.error('Error fetching subcategories:', err);
        res.status(500).json({ error: 'Failed to fetch subcategories' });
    }
});

app.get('/category/:categoryName/:subcategoryname', async (req, res) => {
    const { categoryName, subcategoryname } = req.params;

    try {
        // Adjust database query to match exact field names in the database
        const subcategories = await Brand.find({ 
            categoryname: categoryName, 
            subcategoryname: subcategoryname 
        });

        // Check if subcategories exist, else return 404
        if (!subcategories || subcategories.length === 0) {
            return res.status(404).json({ message: 'No subcategories found' });
        }


        // Respond with the subcategories array
        res.json({ subcategories });
    } catch (err) {
        console.error('Error fetching subcategories:', err);
        res.status(500).json({ error: 'Failed to fetch subcategories' });
    }
});



  app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Logout failed" });
      }

      res.redirect('/login')
    });
  });
  
  app.post('/company', upload3.single('companyimage'), async (req, res) => {
    const { companydescription,companyname, subcategoryname, categoryname, } = req.body;

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newBrand = new Brand({
            companydescription,
            subcategoryname,
            companyname,
            categoryname,
            companyimage: path.join('uploads/com', req.file.filename)
        });

        await newBrand.save();
        res.redirect('/sub-category')
       
    } catch (err) {
 
        console.log(err) // Passes error to the middleware
    }
});

app.get('/Product',async(req,res)=>{
    try {
        const categories = await Category.find(); 
        const subcategories = await Sub.find(); 
        const brand=await Brand.find();
        const Products=await Product.find()  

        res.render('Product', {
            categories: categories,
            subcategories: subcategories,
            companies:brand,
            Product:Products,
            message:''
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send("An error occurred while fetching data");
    }
})

app.post('/add-product', upload4.single('Productimage'),async (req, res) => {
    const { categoryname, subcategoryname, companyname, Productname, Productnamedescription, Productprice } = req.body;

    try {
        // Create a new product
        const newProduct = new Product({
            categoryname,
            subcategoryname,
            companyname,
            Productname,
            Productnamedescription,
            Productprice,
            Productimage:path.join('uploads/Product', req.file.filename)
        });

        // Save the product to the database
        await newProduct.save();

        // Send a success response
     res.redirect('/Product')
    } catch (error) {
        // Handle errors if the product could not be saved
        console.error('Error adding product:', error);
        res.status(500).json({
            message: 'Failed to add product',
            error: error.message
        });
    }
});
app.get('/category/:categoryName/:subcategoryname/:companyname',async (req,res)=>{
    const { categoryName, subcategoryname,companyname } = req.params;

    try {
        const Company = await Product.find({ 
            categoryname: categoryName, 
            subcategoryname: subcategoryname ,
            companyname :companyname

        });

        // Check if subcategories exist, else return 404
        if (!Company || Company.length === 0) {
            return res.status(404).json({ message: 'No subcategories found' });
        }


        res.json({ Company });
    } catch (err) {
        console.error('Error fetching subcategories:', err);
        res.status(500).json({ error: 'Failed to fetch subcategories' });
    }

})


app.delete('/company/:id', async (req, res) => {
    try {
        await Brand.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete company' });
    }
});

// GET /company/edit/:id
app.get('/company/edit/:id', async (req, res) => {
    try {
        const company = await Brand.findById(req.params.id);
        if (!company) {
            return res.status(404).send('Company not found');
        }
        res.render('editCompany', { company, categories }); 
    } catch (error) {
        res.status(500).send('Failed to load edit form');
    }
});

// POST /company/edit/:id
app.post('/company/edit/:id', async (req, res) => {
    try {
        const { companyname, companydescription, categoryname, subcategoryname } = req.body;
        const updateData = { companyname, companydescription, categoryname, subcategoryname };

        if (req.file) {
            updateData.companyimage = req.file.path; 
        }

        await Brand.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/company'); 
    } catch (error) {
        res.status(500).send('Failed to update company');
    }
});


app.get('/product/:productId', async (req, res) => {
    const { productId } = req.params;
  
    try {
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.json({
        Productname: product.Productname,
        Productprice: product.Productprice,
        Productnamedescription: product.Productnamedescription,
        Productimage: product.Productimage,
      });
    } catch (err) {
      console.error('Error fetching product data:', err);
      res.status(500).json({ message: 'Failed to fetch product data' });
    }
  });
  
//   app.post('/add-to-cart', async (req, res) => {
//     const { userId, productId, itemId } = req.body;
  
//     try {
//     //   const existingCartItem = await Cart.findOne({ productId, userId });
  
//     //   if (existingCartItem) {
//     //     return res.status(400).json({ message: 'This item is already in your cart' });
//     //   }
  
//       const cartItem = await new Cart({ userId, productId, itemId });
//       await cartItem.save();
  
//       res.status(200).json({ message: 'Item added to cart successfully' });
//     } 
//     catch (error) {
//     //   if (error.code === 11000) {

//     //     console.log("------"+error+'----------');
    
//     //     return res.status(400).json({ message: 'This item is already in your cart' });
//     //   }
  
//       console.error('Error adding item to cart:', error);
//       res.status(500).json({ message: 'Failed to add item to cart'+error });
//     }
//   });


app.post('/add-to-cart', async (req, res) => {
    const { userId, productId } = req.body;
  
    try {
      // Convert userId and productId to ObjectId
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const productObjectId = new mongoose.Types.ObjectId(productId);
  
      // Check if the user already has the product in their cart
      const existUser = await Cart.findOne({ userId: userObjectId, productId: productObjectId });
  
      if (existUser) {
        res.redirect('/cart/:userId')
      } else {
        // Add new item to the cart
        const newCart = new Cart({ userId: userObjectId, productId: productObjectId });
        await newCart.save();
        console.log('Item added to the cart successfully');
        return res.status(200).json({ message: 'Item added to the cart successfully' });
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      return res.status(500).json({ message: 'Failed to add item to cart' });
    }
  });

  app.get('/cart/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const cart = await Cart.find({ userId }).populate('productId'); // Populate product details
      if (!cart || cart.length === 0) {
        return res.status(404).json({ message: 'Cart is empty' });
      }
  
      res.status(200).json(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


  const razorpay = new Razorpay({
    key_id: 'rzp_test_bRL8fUWDLM9iw9',
    key_secret: '2KOMlHSTzEQnS6NwAZLA73yJ',
});

app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency, receipt } = req.body;

        const order = await razorpay.orders.create({
            amount: amount * 100, // Amount in paise
            currency,
            receipt,
        });

        // Save order details to the database
        const payment = new Payment({
            orderId: order.id,
            amount,
            currency,
            receipt,
        });
        await payment.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        // Verify signature
        const hmac = crypto.createHmac('sha256', '2KOMlHSTzEQnS6NwAZLA73yJ');
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // Update payment status in the database
        await Payment.findOneAndUpdate(
            { orderId: razorpay_order_id },
            { paymentId: razorpay_payment_id, signature: razorpay_signature, status: 'Success' }
        );

        res.json({ success: true, message: 'Payment verified successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});