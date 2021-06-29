const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const Product = require('./models/product')

mongoose.connect('mongodb://localhost:27017/farmStand', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN")
    })
    .catch(err => {
        console.log("MONGO OH NO ERROR!")
        console.log(err)
    })


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

const categories = ['fruit', 'vegetable', 'dairy'];

app.get('/products', async (req, res) => {
    const { category } = req.query; // want to filter by category
    if (category) {
        const products = await Product.find({ category }) //find all products with the same category {category} is same as {category:category}
        res.render('products/index', { products, category }) // pass in to all products and the category from above
    } else {
        const products = await Product.find({}) //find all products if there's none in the category
        res.render('products/index', { products, category: "All" }) // pass in all products in products/index and label category as all
    }
})
app.get('/products/new', (req, res) => {
    res.render('products/new', { categories }) // pass through categories
})
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    console.log(product) // console prints out details of product with that id
    res.render('products/show', { product }) // pass in 1 product per page
})

app.post('/products', async (req, res) => {
    // console.log(req.body)
    const newProduct = new Product(req.body); // req.body is the info the form takes in
    await newProduct.save();
    console.log(newProduct)
    res.redirect(`/products/${newProduct._id}`)
})

app.get('/products/:id/edit', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    res.render('products/edit', { product, categories })
})

app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    // console.log(req.body)
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true })
    // default is to turn validators off so need to put this in
    // will show old info unless you put in new: true
    res.redirect(`/products/${product._id}`);
    // won't have an id unless we await it
})

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products');
})

app.listen(3000, () => {
    console.log('App is listening on port 3000!')
})