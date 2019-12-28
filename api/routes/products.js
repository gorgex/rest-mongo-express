const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/');
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname)
	}
});

const upload = multer({storage});
const Product = require('../models/product');


router.get('/', (req, res, next) => {
	Product.find()
		.select("-__v")
		.exec()
		.then(docs => {
			const response = docs.map(doc => {
				return {
					_id: doc._id,
					name: doc.name,
					price: doc.price,
					image: doc.image,
					url: `http://localhost:3000/products/${doc._id}`
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

router.post('/', upload.single('image'), (req, res, next) => {
	console.log(req.file);
	const product = new Product({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price,
		image: req.file.path
	});
	product
		.save()
		.then(result => {
			res.status(201).json({
				createdProduct: result
			});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

router.get('/:productId', (req, res, next) => {
	const id = req.params.productId;
	Product.findById(id)
		.select("-__v")
		.exec()
		.then(doc => {
			if (doc) {
				res.status(200).json(doc);
			} else {
				res.status(404).json({
					message: "Not found"
				});
			}
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

router.patch('/:productId', (req, res, next) => {
	const id = req.params.productId;
	let updated = {};
	const props = Object.getOwnPropertyNames(Product.schema.obj);
	const reqProps = Object.getOwnPropertyNames(req.body[0]);
	const reqValues = Object.values(req.body[0]);
	for(let prop in props) {
		for(let reqProp in reqProps) {
			if(reqProps[reqProp] === props[prop]) {
				updated[props[prop]] = reqValues[reqProp];
			}
		}
	}
	Product.update({ _id: id }, { $set: updated })
		.exec()
		.then(result => {
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

router.delete('/:productId', (req, res, next) => {
	const id = req.params.productId;
	Product.remove({ _id: id })
		.exec()
		.then(result => {
			res.status(200).json(result);
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;