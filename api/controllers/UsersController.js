/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  addUser:function(req,res){
    
    var today=new Date();
    var dd=String(today.getDate()).padStart(2,'0');
    var mm=String(today.getMonth()+1).padStart(2,'0');
    var yyyy=today.getFullYear();
    today=mm + '/' + dd +'/' +yyyy;
    var id=""+Math.floor(Date.now() / 1000)+Math.floor(Math.random() * 101);
    var totalAmount=0;
    req.body.items.map((data)=>{
        totalAmount=totalAmount+parseInt(data['product-pricePerUnit']);
    })
    var finalPrice=totalAmount;
      Users.findOrCreate({mobile:req.body.mobile},{userid:id,name:req.body.name,mobile:req.body.mobile,Date:today}).exec(async(err,user,wascreated)=>{
        
        if(err){
            console.log(err)
            res.json({message:"error in placing order"})
        }
        if(wascreated){
        Orders.create({orderDate:today,items:req.body.items,totalAmount:totalAmount,couponApplied:req.body.coupon,discount:req.body.coupon,finalPrice:req.body.finalPrice,payment:req.body.payment,paymentId:id,orderStatus:"placed",userName:req.body.name,userMobile:req.body.mobile}).fetch().exec((err,data)=>{
            if(err){
                res.json({message:"error in placing order"})
            }
             else{
                res.json({message:"OrderPlaced",id:id});
            }
        }) 
        }
        if(user){
            Orders.create({orderDate:today,items:req.body.items,totalAmount:totalAmount,couponApplied:req.body.coupon,discount:req.body.coupon,finalPrice:finalPrice,payment:req.body.payment,paymentId:id,orderStatus:"placed",userName:req.body.name,userMobile:req.body.mobile}).fetch().exec((err,data)=>{
                if(err){
                    res.json({message:"error in placing order"})
                }
                 else{
                    res.json({message:"OrderPlaced",id:id});
                }
            }) 
            }
      })
  }

};

