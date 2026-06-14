import dbConnect from "../../../lib/dbConnect";
import Order from "../../../lib/Order";

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === "PATCH") {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!order) return res.status(404).json({ error: "Order not found." });
      return res.status(200).json(order);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update order." });
    }
  }

  if (req.method === "PUT") {
    try {
      const { itemNumber, name, address, phoneNumber, pieces, price, note } = req.body;
      const order = await Order.findByIdAndUpdate(
        id,
        { itemNumber, name, address, phoneNumber, pieces, price, note },
        { new: true, runValidators: true }
      );
      if (!order) return res.status(404).json({ error: "Order not found." });
      return res.status(200).json(order);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update order." });
    }
  }

  if (req.method === "DELETE") {
    try {
      const order = await Order.findByIdAndDelete(id);
      if (!order) return res.status(404).json({ error: "Order not found." });
      return res.status(200).json({ message: "Order deleted." });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete order." });
    }
  }

  res.setHeader("Allow", ["PATCH", "PUT", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
