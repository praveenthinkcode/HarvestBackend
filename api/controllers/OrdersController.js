/**
 * OrdersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
// import * as Orders from '../models/Orders';

let _ = require('lodash');
let path = require('path');
let XLSX = require('xlsx');
let fs = require('fs');
let async = require('async');
let filePath = path.resolve(__dirname + '/../../order_report.csv');

module.exports = {

    getAllOrders: async (req, res) => {

        AuthenticationToken.findOne({token:req.body.token},async (err,found)=>{
            if(found){
                try {
                    let allOrders = await Orders.find();
                    return res.ok({
                        status: 200,
                        allOrders: allOrders
                    })
                } catch (error) {
                    return res.serverError({
                        status: 500,
                        msg: error
                    });
                }
            }
            else{
                return res.json({
                        status: 401
                    })
            }
        })
    },

    getRecentOrders: async (req, res) => {
        AuthenticationToken.findOne({token:req.body.token},async (err,found)=>{
            if(found){
                try {
                    let recentOrders = await Orders.find({ orderStatus: "OrderPlaced" }).sort('createdAt DESC');
                    let groupedItems = await Orders.consolidateOrders();
                    return res.ok({
                        status: 200,
                        recentOrders: recentOrders,
                        groupedItems: groupedItems
                    });
                } catch (error) {
                    return res.serverError({
                        status: 500,
                        msg: error
                    });
                }
            }
            else{
                return res.json({
                    status: 401
                })
            }
        })

    },

    markAsDelivered: async (req, res) => {
        try {
            let orderStatusPatch = {
                orderStatus: 'Delivered',
            };
            await Orders.update({ orderId: req.body.orderId }, orderStatusPatch);
            let order = await Orders.findOne({ orderId: req.body.orderId });
            res.ok({
              status: 200,
              msg: 'Marked as Delivered'
            });
        } catch (error) {
            return res.serverError({
              status: 500,
              msg: error
            });
        }
    },

    rejectOrder: async (req, res) => {
        try {
            let orderStatusPatch = {
                orderStatus: 'Rejected',
            };
            await Orders.update({ orderId: req.body.orderId }, orderStatusPatch);
            let order = await Orders.findOne({ orderId: req.body.orderId });
            res.ok({
              status: 200,
              msg: 'Marked as Rejected'
            });
        } catch (error) {
            return res.serverError({
              status: 500,
              msg: error
            });
        }
    },

    
    downloadConsolidatedProducts: async (req,res)=>{

        try{
          var orderReports=[];
          let groupedItems = await Orders.consolidateOrders();
          Object.keys(groupedItems).map((key)=>{
            groupedItems[key].map((product,i)=>{
              var unit=(product['product-price']!=='others')?product['product-price']:product['product-priceOthers'];
              var orderDetails={'Category':key,'Items':product['product-name']+' - '+product['product-quantity']+' '+unit+' - Rs.'+product['product-total']};
              orderReports.push(orderDetails);
            })
          })
            var workSheet = XLSX.utils.json_to_sheet(orderReports, {dateNF: 'yyyy-mm-dd@'});
            var workBook = XLSX.utils.book_new();
  
            XLSX.utils.book_append_sheet(workBook, workSheet, 'consolidated_products');
            XLSX.writeFile(workBook, filePath);
  
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-disposition', 'attachment; filename=' + 'consolidated_products_reports.csv');
              var filestream = fs.createReadStream(filePath);
              filestream.pipe(res);
            }
            else {
              return res.json({error : "File not Found"});
            }
        
        }
        catch (error) {
          return res.serverError({
            status: 500,
            msg: error
          });
        }
    },
    
    downloadOrderReport: async (req, res) => {

      try {

        let recentOrders = await Orders.find({ orderStatus: "OrderPlaced" });
        let groupedItems = await Orders.consolidateOrders();
       var loop=true;
        let orderReports = [];

        async.forEachOf(recentOrders, (order, key, cb) => {

          var orderDetails = {
            'OrderId': order.orderId,
            'Name': order.userName,
            'Mobile': order.userMobileNo,
            'OrderDate': order.orderDate,
            'Orders': '',
            'Total Price': order.finalPrice
          };

          async.forEachOf(order.items, (orderItem, key, innercb) => {
            var unit=(orderItem['product-price']!=='others')?orderItem['product-price']:orderItem['product-priceOthers'];
            let items = orderItem['product-name'] + ' - ' + orderItem['product-quantity'] + ' ' + unit;
            if (key < order.items.length - 1) {
              items = items + ', ';
            }
            orderDetails['Orders'] += items;
            innercb();
          },
          () => {
            if(loop){
              loop=false;
            Object.keys(groupedItems).map((key)=>{
              let consolidatedItems;
              groupedItems[key].map((product,i)=>{
                var unit=(product['product-price']!=='others')?product['product-price']:product['product-priceOthers'];
               consolidatedItems=product['product-name']+' '+product['product-quantity']+' '+unit;
               if(i<groupedItems[key].length-1){
                 consolidatedItems=consolidatedItems+', ';
               }
               (orderDetails[key]!=null)?orderDetails[key]+=consolidatedItems:orderDetails[key]=consolidatedItems;
              })
            })
          }
          orderReports.push(orderDetails);
          cb();
          });
        },
        () => {

          var workSheet = XLSX.utils.json_to_sheet(orderReports, {dateNF: 'yyyy-mm-dd@'});
          var workBook = XLSX.utils.book_new();

          XLSX.utils.book_append_sheet(workBook, workSheet, 'consolidated_orders');
          XLSX.writeFile(workBook, filePath);

          if (fs.existsSync(filePath)) {
            res.setHeader('Content-disposition', 'attachment; filename=' + 'consolidated_order_reports.csv');
            var filestream = fs.createReadStream(filePath);
            filestream.pipe(res);
          }
          else {
            return res.json({error : "File not Found"});
          }
        });
      }
      catch (error) {
        return res.serverError({
          status: 500,
          msg: error
        });
      }
    }
};

