/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help :: See https://sailsjs.com/docs/concepts/actions
 */
// import expireOrders from './OrdersController';
var ordersController = require('./OrdersController');
var jwt = require('jsonwebtoken');

module.exports = {
    // User Login
    login: async function(req,res) {

        var token = null;
        var secretKey = req.body.secretKey;

        if (!secretKey) {
            res.json({message:"Invalid SecretKey", token: ''});
        }

        var today=new Date();
        var dd=String(today.getDate()).padStart(2,'0');
        var mm=String(today.getMonth()+1).padStart(2,'0');
        var yyyy=today.getFullYear();
        today = mm + '/' + dd + '/' +yyyy;

        Auth.findOne({secretKey:secretKey},function(err,user){
            if (user){

                if (user.role === "customer") {
                    token = jwt.sign({user:today},secretKey);
                    AuthenticationToken.create({token:token,Date:today}).exec((err,user)=>{
                        if(err){
                        }
                        else{
                            res.json(
                                {
                                    message:"SuccessCustomer",
                                    token:token
                                });
                        }
                    });
                } else if (user.role === "admin") {
                    token=jwt.sign({user:secretKey},"admin");
                    AuthenticationToken.create({token:token,Date:today}).exec((err,user)=>{
                        if(err){
                        }
                        else{
                            ordersController.expireOrders();                                        // To Expire(Mark as Delivered) orders older than one week
                            res.json(
                                {
                                    message:"SuccessAdmin",
                                    token:token
                                });
                        }
                    });
                }
            } else {
                res.json(
                    {
                        message:"Invalid SecretKey",
                        token: ''
                    });
            }
        });
    },
};
