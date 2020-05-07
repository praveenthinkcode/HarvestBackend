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
         try {
            // let itemsList = await Ecom.find().sort('productId DESC');
            // let currentId = itemsList[0].productId + 1;
            await Products.create({
               name: req.body.name,
               category: req.body.category.charAt(0).toUpperCase() + req.body.category.slice(1),
               description: req.body.description,
               price: req.body.price,
               priceOthers: (req.body.price === 'others') ? req.body.priceOthers : '',
               image: req.body.image,
               pricePerUnit: req.body.pricePerUnit,
               availability: req.body.availability,
               sellers: [],
            });
            res.ok({
              status: 200,
              msg: 'PRODUCT ADDED'
            });
         } catch(error) {
            res.serverError({
              status: 500,
              msg: error
            });
         }
      },

      getAllProducts: async (req, res) => {
          AuthenticationToken.findOne({token:req.body.token},async (err,found)=>{
              if(found){
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
              }
              else{
                  return res.json({
                      status:401
                  })
              }
          })

      },

      editProduct: async(req, res) => {
          try {
            let patch = {
              name: req.body.name,
              price: req.body.price,
              description: req.body.description,
              priceOthers: (req.body.price === 'others') ? req.body.priceOthers : '',
              pricePerUnit: req.body.pricePerUnit,
              image: req.body.image,
              category:req.body.category.charAt(0).toUpperCase() + req.body.category.slice(1),
              availability: req.body.availability,
            };
              await Products.update({id: req.body.id}, patch);
              res.ok({
                status: 200,
                msg: 'PRODUCT EDITED',
              });
            } catch(error) {
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

