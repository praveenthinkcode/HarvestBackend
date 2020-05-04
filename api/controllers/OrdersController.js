
/**
 * OrdersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
// import * as Orders from '../models/Orders';

let _ = require('lodash');
let jsontocsv = require('jsontocsv');
let path = require('path');
let XLSX = require('xlsx');
let filePath = path.resolve(__dirname + '/../../order_report.csv');


module.exports = {
    getAllOrders: async (req, res) => {
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
    },

    getRecentOrders: async (req, res) => {
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

    recentOrdersDownload: () => {
      jsontocsv(inputStream, outputStream, {header: false, separator: ','}, function (err) {
        if (!err) console.log('Success.')
      });
    },
  consolidatedOrdersCSV: async (req, res) => {
    let consolidatedOrders = await Orders.consolidateOrders();
    let workSheet = XLSX.utils.json_to_sheet(consolidatedOrders, {dateNF: 'yyyy-mm-dd@'});
    let workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'consolidated_orders');
    XLSX.writeFile(workBook, filePath);

    if(fs.existsSync(filePath)) {
      res.setHeader('Content-disposition', 'attachment;filename=' + 'test_reports.csv');
      var fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.json({
        err: 'File Not Found'
      })
    }

  }
};

