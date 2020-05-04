/**
 * Orders.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      orderId: {
          type: 'string',
          unique: true,
      },
      orderDate: {
          type: 'number',
          required: false,
      },
      items: {
          type: 'json',
          columnType: 'array',
          allowNull: false,
      },
      totalPrice: {
          type: 'number',
          allowNull: false,
      },
      couponsApplied: {
          type: 'string',
          allowNull: true,
          required: false,
      },
      discount: {
          type: 'number',
          allowNull: true,
          defaultsTo: 0,
          required: false,
      },
      finalPrice: {
          type: 'number',
          allowNull: false,
      },
      paymentMode: {
          type: 'string',
          allowNull: false,
          defaultsTo: 'COD',
          // required: true,
      },
      paymentID: {
          type: 'string',
          allowNull: false,
      },
      orderStatus: {
          type: 'string',
          allowNull: false,
          defaultsTo: 'Order Placed',
          required: false,
      },
      userName: {
          type: 'string',
          allowNull: false,
          required: true,
      },
      userMobileNo: {
          type: 'string',
          allowNull: false,
          required: true,
      }


  },

consolidateOrders: async () => {
  let orderItems = await Orders.find({ orderStatus: 'Order Placed' });
  let items = [];
  orderItems.map((orderItem) => {
    orderItem.items.map((item) => {
      items.push(item);
    })
  });
  let groupedItems = _.groupBy(items, 'category');
  let consolidatedItems = [];
  Object.keys(groupedItems).map((key) => {
    let tempArr = [];
    groupedItems[key].map((item) => {
      console.log('ITEM::::', item);
      if(tempArr.length === 0) {
        tempArr.push(item);
      } else {
        let flag = 0;
        tempArr.map((tempItem) => {
          if(tempItem.id === item.id) {
            flag = 1;
            tempItem.quantity += item.quantity;
          }
        });
        if(flag === 0) {
          tempArr.push(item);
        }
      }
    });
    groupedItems[key] = tempArr;
  });
  console.log('GROUPED::', groupedItems);
  return groupedItems;
}
};

