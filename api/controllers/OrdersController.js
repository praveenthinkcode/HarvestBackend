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
var startDate='';
var endDate='';
var dateSelected='no';
let filePath = path.resolve(__dirname + '/../../order_report.csv');

module.exports = {
    // Get All Orders
    getAllOrders: async (req, res) => {
        AuthenticationToken.findOne({token:req.body.token},async (err,found)=>{
            if(found){
                try {
                    var allOrders = await Orders.find();
                    var startDat=new Date(req.body.startDate);
                    startDat=startDat.getTime();
                    var endDat=new Date(req.body.endDate);
                    endDat.setDate(endDat.getDate());
                    endDat=endDat.getTime();
                    var filterVisible=false;
                    if(req.body.dateSelected!=='no'){
                        var allOrders1=[];
                        allOrders.map((orders)=>{
                        if(orders.createdAt>=startDat&&orders.createdAt<=endDat){
                            allOrders1.push(orders);
                        }
                    })
                    filterVisible=true;
                    allOrders=allOrders1;
                    }
                    return res.ok({
                        status: 200,
                        allOrders: allOrders,
                        filterVisible:filterVisible
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
                    });
            }
        })
    },

    // Get Pending Orders
    getRecentOrders: async (req, res) => {
        startDate=new Date(req.body.startDate);
        startDate=startDate.getTime();
        endDate=new Date(req.body.endDate);
        endDate.setDate(endDate.getDate());
        endDate=endDate.getTime();
        dateSelected=req.body.dateSelected;
        AuthenticationToken.findOne({token:req.body.token},async (err,found)=>{
            if(found){
                try {
                    let recentOrders = await Orders.find({ orderStatus: "OrderPlaced" }).sort('orderDate DESC');
                    var filterVisible = false;
                    if(req.body.dateSelected !== 'no'){
                        var recentOrders1 = [];
                        recentOrders.map((orders)=>{
                            if(orders.createdAt >= startDate && orders.createdAt <= endDate){
                                recentOrders1.push(orders);
                            }
                        });
                        filterVisible=true;
                        recentOrders=recentOrders1;
                    }
                    let groupedItems = await Orders.consolidateOrders(startDate,endDate,dateSelected);
                    return res.ok({
                        status: 200,
                        recentOrders: recentOrders,
                        groupedItems: groupedItems,
                        filterVisible:filterVisible
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
        });
    },

    // Mark Order As Delivered
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

    // Reject an Order
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

    // Download Consolidated Order Report
    downloadConsolidatedOrderReport: async (req,res)=>{
        try{
            var orderReports=[];
            let groupedItems = await Orders.consolidateOrders(startDate,endDate,dateSelected);
            Object.keys(groupedItems).map((key)=>{
                groupedItems[key].map((product,i)=>{
                    var unit=(product['product-price']!=='others')?product['product-price']:product['product-priceOthers'];
                    var orderDetails = {
                        'Category': key,
                        'Items': product['product-name'],
                        'Quantity': product['product-quantity'] + ' - ' + unit,
                        'Price': 'Rs.' + product['product-total']
                    };
                    orderReports.push(orderDetails);
              });
            });
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
        } catch (error) {
            return res.serverError({
                status: 500,
                msg: error
            });
        }
    },

    // Download Order Report
    downloadOrderReport: async (req, res) => {
        try {
            let recentOrders = await Orders.find({ orderStatus: "OrderPlaced" });
            if(dateSelected!=='no'){
                var recentOrders1=[];
            recentOrders.map((orders)=>{
                if(orders.createdAt>=startDate&&orders.createdAt<=endDate){

                    recentOrders1.push(orders);
                }
            });
            recentOrders=recentOrders1;
            }
            let groupedItems = await Orders.consolidateOrders();
            let orderReports = [];

            async.forEachOf(recentOrders, (order, key, cb) => {
                let timestamp = new Date(order.createdAt);
                var orderDetails = {
                    'OrderId': order.orderId,
                    'Name': order.userName,
                    'Mobile': order.userMobileNo,
                    'OrderDate': `${timestamp.getDate()}/${timestamp.getMonth()+1}/${timestamp.getFullYear()}`,
                    'Orders': '',
                    'Total Price': order.finalPrice
                };

                async.forEachOf(order.items, (orderItem, key, innercb) => {
                    var unit = (orderItem['product-price']!=='others')?orderItem['product-price']:orderItem['product-priceOthers'];
                    let items = orderItem['product-name'] + ' - ' + orderItem['product-quantity'] + ' ' + unit;
                    if (key < order.items.length - 1) {
                        items = items + ', ';
                    }
                    orderDetails['Orders'] += items;
                    innercb();
                }, () => {
                    orderReports.push(orderDetails);
                    cb();
                });
            }, () => {
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
        } catch (error) {
            return res.serverError({
                status: 500,
                msg: error
            });
        }
    },

    // Expire(Mark as Delivered) orders older than a week old - Called when Admin/Moderator logs in
    expireOrders: async () => {
        let pendingOrders = await Orders.find({ orderStatus: "OrderPlaced" });
        let currentDate = new Date().getTime();
        pendingOrders.map(async (order) => {
            // 604800000 - One Week in Milli seconds
            if(currentDate - order.createdAt >= 604800000) {
                order.orderStatus = 'OLD';
                await Orders.updateOne({ id: order.id })
                    .set({
                        orderStatus: 'Delivered'
                    });
            } else {
                console.log('ORDER::is not a week old:', order);
            }
        });
    },
};

