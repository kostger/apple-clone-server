const express = require("express");
const CartItem = require("../models/CartItem");
const router = express.Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
// Get all items in the user's cart
router.get("/", isAuthenticated, (req, res) => {
  CartItem.find({ user: req.payload._id }) // Only fetch items for the logged-in user
    .then((items) => res.status(200).json(items))
    .catch((err) =>
      res.status(500).json({ message: "Internal Server Error", error: err })
    );
});

// Add a new item to the cart
router.post("/add", isAuthenticated, (req, res) => {
  const { type, color, image, size, quantity, price } = req.body;
  const userId = req.payload._id; // Get the user ID from the JWT payload

  const newItem = new CartItem({
    type,
    color,
    image,
    size,
    quantity,
    price,
    user: userId,
  });

  newItem
    .save()
    .then((item) => res.status(201).json(item))
    .catch((err) =>
      res.status(500).json({ message: "Internal Server Error", error: err })
    );
});

// Delete an item from the cart
router.delete("/:id", isAuthenticated, (req, res) => {
  CartItem.findOneAndDelete({ _id: req.params.id, user: req.payload._id }) // Check item ownership
    .then((item) => {
      if (!item) {
        return res
          .status(404)
          .json({ message: "Item not found or not authorized" });
      }
      res.status(200).json({ message: "Item deleted successfully" });
    })
    .catch((err) =>
      res.status(500).json({ message: "Internal Server Error", error: err })
    );
});

// Edit an item in the cart
router.put("/:id", isAuthenticated, (req, res) => {
  const { type, color, quantity } = req.body;

  CartItem.findOneAndUpdate(
    { _id: req.params.id, user: req.payload._id }, // Ensure the item belongs to the user
    { type, color, quantity },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res
          .status(404)
          .json({ message: "Item not found or not authorized" });
      }
      res.status(200).json(item);
    })
    .catch((err) =>
      res.status(500).json({ message: "Internal Server Error", error: err })
    );
});

module.exports = router;
