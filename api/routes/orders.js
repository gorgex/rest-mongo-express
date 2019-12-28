const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
	Order.find()
		.select("-__v")
		.populate('product', '-__v')
		.exec()
		.then(docs => {
			const response = docs.map(doc => {
				return {
					_id: doc._id,
					product: doc.product,
					quantity: doc.quantity,
					url: `http://localhost:3000/orders/${doc._id}`
				}
			});
			res.status(200).json(response);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

router.post('/', (req, res, next) => {
	Product.findById(req.body.productId)
		.then(product => {
			if (!product) {
				res.status(404).json({
					message: 'Product not found'
				});
			}
			const order = new Order({
				_id: mongoose.Types.ObjectId(),
				product: req.body.productId,
				quantity: req.body.quantity
			});
			return order.save();
		})
		.then(result => {
			res.status(201).json(result);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

router.get('/:orderId', (req, res, next) => {
	Order.findById(req.params.orderId)
		.select("-__v")
		.populate('product', '-__v')
		.exec()
		.then(order => {
			if(!order) {
				return res.status(404).json({
					message: 'Order not found'
				});
			}
			res.status(200).json(order);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

router.delete('/:orderId', (req, res, next) => {
	Order.remove({_id: req.params.orderId})
		.exec()
		.then(result => {
			res.status(200).json({
				message: 'Order deleted',
				url: 'http://localhost:3000/orders'
			});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;