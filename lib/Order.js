import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  itemNumber: { type: String, required: true },
  dateTime: { type: Date, default: Date.now },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  pieces: { type: Number, default: 1 },
  price: { type: Number, required: true },
  note: { type: String, default: "" },
  status: { type: String, default: "Pending" },
});

delete mongoose.models.Order;
export default mongoose.model("Order", OrderSchema);
