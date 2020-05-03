/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var jwt = require('jsonwebtoken');
var token;
module.exports = {
 login:function(req,res){
    var secretKey=req.body.secretKey;
    var today=new Date();
     var dd=String(today.getDate()).padStart(2,'0');
     var mm=String(today.getMonth()+1).padStart(2,'0');
    var yyyy=today.getFullYear();
     today=mm + '/' + dd +'/' +yyyy;
    Auth.findOne({secretKey:secretKey},function(err,user){
        if(user){
            if(user.role==="customer"){
            token=jwt.sign({user:req.body.deviceId},secretKey);
            AuthenticationToken.create({deviceId:req.body.deviceId,token:token,Date:today}).exec((err,user)=>{
                if(err){
                    console.log("Error creating Token")
                }
                else{
                    res.json({message:"SuccessCustomer",token:token});
                }
            })   
            }
            else if(user.role==="admin"){
                token=jwt.sign({user:req.body.deviceId},secretKey);
                AuthenticationToken.create({deviceId:req.body.deviceId,token:token,Date:today}).exec((err,user)=>{
                    if(err){
                        console.log("Error creating Token")
                    }
                    else{
                        res.json({message:"SuccessAdmin",token:token});
                    }
                }) 
                }
        }
    })
 },
 

};

