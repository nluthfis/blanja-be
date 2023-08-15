const router = require("express").Router();

const orderController = require("../controllers/order.controller");

const middleware = require("../middleware/jwt.middleware");

router.get("/order", middleware, orderController.getAllOrder);

router.post("/product/createOrder", middleware, orderController.createOrder);

router.patch("/editorder", middleware, orderController.editOrder);

router.delete("/order/delete-order", middleware, orderController.deleteOrder);

router.post("/create-payment", middleware, orderController.createPayment);

router.get("/check-status", middleware, orderController.checkStatus);

router.patch("/update-status", orderController.updateStatus);

module.exports = router;
