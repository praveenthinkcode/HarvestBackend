/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': { view: 'pages/homepage' },

  // Get All Orders
  'POST /orders/allOrders': 'OrdersController.getAllOrders',
  // Get Recent Orders
  'POST /orders/recentOrders': 'OrdersController.getRecentOrders',
  // Mark Order as Delivered
  'POST /orders/markAsDelivered': 'OrdersController.markAsDelivered',
  // Mark Order as Rejected - Reject order
  'POST /orders/rejectOrder': 'OrdersController.rejectOrder',
  // Create Order
  'POST /orders/createOrder': 'OrdersController.createOrder',
  // Download Order Report - Pending Orders
  'GET /orders/downloadOrderReport': 'OrdersController.downloadOrderReport',
  // Download Order Report - Consolidated Orders Report
  'GET /orders/downloadConsolidatedOrderReport': 'OrdersController.downloadConsolidatedOrderReport',
  // Create/Add Product
  'POST /products/createProduct': 'ProductsController.createProduct',
  // Get All Products - Manage Products Page - Admin/Moderator Side
  'POST /products/allProducts': 'ProductsController.getAllProducts',
  // Edit/Update Product
  'PATCH /products/editProduct': 'ProductsController.editProduct',
  // Delete Product
  'DELETE /products/deleteProduct': 'ProductsController.deleteProduct',
  // Remove User
  'POST /users/removeUser': 'Users.Controller.removeUser',
  // Add User
  'POST /users/addUser':  'UsersController.addUser',
  // Get Products - Home Page - User/Customer Side
  'POST /products/getProducts': 'ProductsController.getProducts',
  // Check Product Uniqueness
  'POST /products/uniqueProduct/':'ProductsController.uniqueProduct',
  // Login
  'POST /auth/login':  'AuthController.login'
};
