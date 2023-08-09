var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs');
const nanoid = require('nanoid').customAlphabet('0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOASDFGHJKLZXCVBNM', 5);
const createError = require('http-errors');
const products = require('./products.json');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    //middleware to view the request details
	console.log('url: ' + req.originalUrl, '\tmethod:', req.method, '\tContent-Type:', req.get('Content-Type'), '\tdata:', JSON.stringify(req.params), JSON.stringify(req.query), JSON.stringify(req.body));
	next();
});

app.get('/product',(req,res,next)=>{
    if(req.query.id){
        console.log('single product');
        const i = products.findIndex(item => item.id === req.query.id);
        if(i==-1){
            throw createError(404, `Product with ID ${req.query.id} not found.`);
        }
        res.status(200).json(products[i])
    }else if(req.query.filter){
        console.log('filter product');
        if(req.query.price ){
            try{
                req.query.price = parseInt(req.query.price);
            }catch(err){
                next(createError(400, err.message));
            }
        }
        if(req.query.stockQuantity){
            try{
                req.query.stockQuantity = parseInt(req.query.stockQuantity);
            }catch(err){
                next(createError(400, err.message));
            }
        }
        let tmp =filterProducts({
            productName: req.query.productName ? req.query.productName : null,
            productCategory:req.query.productCategory?req.query.productCategory:null,
            price:req.query.price ? req.query.price : null,
            stockQuantity:req.query.stockQuantity ? req.query.stockQuantity : null
        })
        res.status(200).json(tmp);
    }else{
        console.log('all product');
        res.status(200).json(products);
    }
});

app.post('/product',(req,res)=>{
    if(!req.body.productName || !req.body.productDescription || !req.body.price || !req.body.category || !req.body.stockQuantity){
        throw createError(400, 'Missing input fields.')
    }
    if(typeof req.body.price !== 'number'){
        throw createError(400, 'Please ensure that the \'price\' field is of type number.');
    }
    if(typeof req.body.stockQuantity !== 'number'){
        throw createError(400, 'Please ensure that the \'stockQuantity\' field is of type number.');
    }
    products.push({
        id: nanoid(),
        productName: req.body.productName,
        productDescription: req.body.productDescription,
        price: req.body.price,
        category: req.body.category, 
        stockQuantity: req.body.stockQuantity,
        createdAt: Date.now(),
        updatedAt: Date.now()
    })
    res.status(200).send('Products have been added successfully.');
});

app.patch('/product',(req,res)=>{
    if(!req.body.id){
        throw createError(400, 'Product update request failed: Please provide the unique identifier for the product.');
    }
    if(Object.keys(req.body).length<2){
        throw createError(400, 'Missing input fields.')
    }
    const i = products.findIndex(item => item.id === req.body.id);
    if(i==-1){
        throw createError(404, `Product with ID ${req.body.id} not found.`);
    }
    if(typeof req.body.price !== 'number'){
        throw createError(400, 'Please ensure that the \'price\' field is of type number');
    }
    if(typeof req.body.stockQuantity !== 'number'){
        throw createError(400, 'Please ensure that the \'price\' field is of type number');
    }
    products[i].productName = req.body.productName?req.body.productName:products[i].productName;
    products[i].productDescription = req.body.productDescription?req.body.productDescription:products[i].productDescription;
    products[i].price = req.body.price?req.body.price:products[i].price;
    products[i].category = req.body.category?req.body.category:products[i].category;
    products[i].stockQuantity = req.body.stockQuantity?req.body.stockQuantity:products[i].stockQuantity;
    products[i].updatedAt = Date.now();
    res.status(200).json({
        message:`Product ${products[i].productName} updated successfully.`,
        data:products[i]
    });
});

app.delete('/product',(req,res)=>{
    if(!req.body.id){
        throw createError(400, 'Product delete request failed: Please provide the unique identifier for the product.');
    }
    // products = products.filter(item => item.id !== req.body.id); // -> can be used too to delete the product but implementing another method if showcase condition handling if in case CRUD operation was performed on DB
    const i = products.findIndex(item => item.id === req.body.id);
    if(i==-1){
        throw createError(404, `Product with ID ${req.body.id} not found.`);
    }
    products.splice(i,1);
    res.status(200).send(`Product deleted successfully.`);
});

//error handler
app.use(function (err, req, res, next) {
    console.error(Date.now() + '\terror:', err.name, err.message, err);
    err.status = (err.status || 500);
    res.status(err.status).send(err.status == 500 ? 'Internal server error, please try again later.' : err.message);
});

function filterProducts(filterOptions) {
    console.log('filterOptions:',filterOptions)
    return products.filter(product => {
      const productNameMatch = filterOptions.productName==null?false: product.productName.toLowerCase().includes(filterOptions.productName.toLowerCase());
      const productCategoryMatch = filterOptions.productCategory ===null || product.category.toLowerCase().includes(filterOptions.productCategory.toLowerCase());
      const priceMatch = filterOptions.price === undefined || product.price === filterOptions.price;
      const stockQuantityMatch = filterOptions.stockQuantity === undefined || product.stockQuantity === filterOptions.stockQuantity;
        console.log('filterResult:',productNameMatch,productCategoryMatch,priceMatch,stockQuantityMatch)
      return productNameMatch || productCategoryMatch || priceMatch ||stockQuantityMatch;
    });
  }


process.on('SIGINT', function () {
	// driver.close();
	try {
        fs.writeFileSync('./products.json', JSON.stringify(products, null, 2), 'utf8');
        console.log('Data has been updated and saved.');
      } catch (err) {
        console.error('Error writing to file:', err);
      }finally{
        process.exit(0);
      }
});

module.exports = app;
