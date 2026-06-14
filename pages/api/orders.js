import dbConnect from "../../lib/dbConnect";
import Order from "../../lib/Order";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const orders = await Order.find({}).sort({ dateTime: -1 });
      return res.status(200).json(orders);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch orders." });
    }
  }

  if (req.method === "POST") {
    try {
      const { itemNumber, name, address, phoneNumber, pieces, price, note } = req.body;
      if (!itemNumber || !name || !address || !phoneNumber || price === undefined) {
        return res.status(400).json({ error: "All fields except note are required." });
      }
      const order = await Order.create({
        itemNumber,
        name,
        address,
        phoneNumber,
        pieces: pieces !== undefined ? pieces : 1,
        price,
        note: note || "",
      });
      return res.status(201).json(order);
    } catch (err) {
      return res.status(500).json({ error: "Failed to create order." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
