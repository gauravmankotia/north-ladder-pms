# north-ladder-pms

**Base URL** : http://54.173.248.174

## ENDPOINTS:

### - Add Product
    URL: /product
    METHODL: POST
    Body:  {
      "productName": "string", // Name of the product
      "productDescription": "string", // Description of the product
      "price": "number", // Price of the product
      "category": "string", // Category of the product
      "stockQuantity": "number", // Quantity of the product in stock
    }

    RESPONSE: 
              + success: Message
              + error: Error object
  
### - Update Product
    URL: /product
    METHOD: PATCH
    Body:  {
      "productName": "string", // Name of the product
      "productDescription": "string", // Description of the product
      "price": "number", // Price of the product
      "category": "string", // Category of the product
      "stockQuantity": "number", // Quantity of the product in stock
    }

    RESPONSE: 
              + success: Message
              + error: Error object
    
### - Delete Product
    URL: /product
    METHOD: DELETE
    Body:  {
      "id": "string" // Unique identifier for the product
    }
    RESPONSE: 
              + success: Message
              + error: Error object

### - Get all product
    URL: /product
    METHOD: GET
    RESPONSE: Products object array

### - Get specific product using product ID
    URL: /product?id=productID
    METHOD: GET
    RESPONSE: 
              + success: Product object
              + error: Error info


### - Get product using all or single filter (productName, productCategory, price, stockQuantity)
    URL: /product?filter=true&price= 2.49&stockQuantity=150&productName=Apples&productCategory=Clothing
    METHOD: GET
    RESPONSE: JSON Object array
