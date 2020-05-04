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
    },
    createProduct: async (req, res) => {
        console.log('CREATE HIT');
         try {
            // let itemsList = await Ecom.find().sort('productId DESC');
            // let currentId = itemsList[0].productId + 1;
            await Products.create({
               name: req.body.name,
               category: req.body.category,
               price: req.body.price,
               pricePerUnit: req.body.pricePerUnit,
               sellers: [],
            });
            res.ok({
              status: 200,
              msg: 'PRODUCT ADDED'
            });
         } catch(error) {
            console.log('ERROR CREATING ITEM::', error);
            res.serverError({
              status: 500,
              msg: error
            });
         }
      },
    
      getAllProducts: async (req, res) => {
        try {
          let allProducts = await Products.find();
          return res.ok({
            status: 200,
            allProducts: allProducts});
        } catch (error) {
          return res.serverError({
            status: 500,
            msg: error
          });
        }
      },
    
      editProduct: async(req, res) => {
          try {
            let patch = {
              name: req.body.name,
              price: req.body.price,
              pricePerUnit: req.body.pricePerUnit,
              category:req.body.category
            };
              await Products.update({id: req.body.id}, patch);
              res.ok({
                status: 200,
                msg: 'PRODUCT EDITED',
              });
            } catch(error) {
              console.log('ERROR EDITITNG PRODUCT::', error);
              res.serverError({
                status: 500,
                msg: error
              });
            }
      },
    
      deleteProduct: async (req, res) => {
        try {
          await Products.destroy({id: req.body.id});
          res.ok({
            status: 200,
            msg: 'PRODUCT DELETED'
          });
        } catch (error) {
          res.serverError(error);
        }
      }
    
};

