/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // Add User
    addUser:function(req,res){
        var id=""+Math.floor(Date.now() / 1000)+Math.floor(Math.random() * 101);
        var totalPrice=0;
        req.body.items.map((data)=>{
            totalPrice=totalPrice+parseInt(data['product-total']);
        });
        var finalPrice=totalPrice;
        Users.findOrCreate(
            {
                mobile:req.body.mobile
            },
            {
                userid:id,
                name:req.body.name,
                mobile:req.body.mobile,
                Date:new Date().getTime()
            }).exec(async(err,user,wascreated)=>{
                if(err) {
                    res.json({message:"error in placing order"})
                }
                if(user) {
                    Orders.create(
                        {
                            orderId:id,
                            orderDate:new Date().getTime(),
                            items:req.body.items,
                            totalPrice:totalPrice,
                            couponApplied:req.body.coupon,
                            discount:req.body.coupon,
                            finalPrice:finalPrice,
                            paymentID:id,
                            orderStatus:"OrderPlaced",
                            userName:req.body.name,
                            userMobileNo:req.body.mobile
                        }).fetch().exec((err,data)=>{
                            if(err){
                                res.json({message:"error in placing order"})
                            }
                            else{
                                res.json({message:"OrderPlaced",orderID:id,});
                            }
                        })
                }
            })
    },

  // Remove User
    removeUser:async function(req,res){
        var removeUser=await AuthenticationToken.destroyOne({ token:req.body.token });
        if(removeUser){
            res.json({message:"Success"});
        }
    }
};

