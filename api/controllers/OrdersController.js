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
                    console.log('ORDERS::', allOrders);
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
                    let recentOrders = await Orders.find({ orderStatus: "Order Placed" });
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
            console.log('UPDATED ORDER::', order);
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
    
    downloadOrderReport: async (req, res) => {

      try {

        let recentOrders = await Orders.find({ orderStatus: "Order Placed" });
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
            let items = orderItem['product-name'] + ' - ' + orderItem['product-quantity'] + ' ' + orderItem['product-price'];
            if (key < order.items.length - 1) {
              items = items + ', ';
            }
            orderDetails['Orders'] += items;
            innercb();
          },
          () => {
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

