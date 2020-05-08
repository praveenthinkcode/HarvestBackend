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

  'POST /orders/allOrders': 'OrdersController.getAllOrders',
  // Get Recent Orders
  'POST /orders/recentOrders': 'OrdersController.getRecentOrders',
  // Mark Order as Delivered
  'POST /orders/markAsDelivered': 'OrdersController.markAsDelivered',
  // Mark Order as Rejected - Reject order
  'POST /orders/rejectOrder': 'OrdersController.rejectOrder',
  // Create Order
  'POST /orders/createOrder': 'OrdersController.createOrder',
  // CSV convert
  'GET /orders/downloadOrderReport': 'OrdersController.downloadOrderReport',
  // Create/Add Product
  'POST /products/createProduct': 'ProductsController.createProduct',
  // Get All Products
  'POST /products/allProducts': 'ProductsController.getAllProducts',
  // Edit/Update Product
  'PATCH /products/editProduct': 'ProductsController.editProduct',
  // Delete Product
  'DELETE /products/deleteProduct': 'ProductsController.deleteProduct',

  'POST /users/removeUser': 'Users.Controller.removeUser',

  'POST /users/addUser':  'UsersController.addUser',

  'POST /products/getProducts': 'ProductsController.getProducts',

  'POST /products/uniqueProduct/':'ProductsController.uniqueProduct',

  'POST /auth/login':  'AuthController.login'
  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
