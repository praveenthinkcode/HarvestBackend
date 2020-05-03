/**
 * ProductsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    getProducts:async function(req,res){
        AuthenticationToken.findOne({token:req.body.token},async (err,found)=>{
            if(found){
                var data=await Products.find().sort();
                res.json({message:"Success",data:data})  
            }
            else{
                res.json({message:"Invalid user login again"})
            }
        })
    },
    uniqueProduct:function(req,res){
        Products.findOne({id:req.body.productId},(err,found)=>{
            if(found){
                res.json({message:"Success",data:found});
            }
        })
    }

};

