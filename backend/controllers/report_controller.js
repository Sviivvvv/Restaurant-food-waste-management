const WasteEntry = require("../models/waste_entry_model");
const { build_filter } = require("./waste_entry_controller");

// Manager and Admin: total financial loss and total weight, broken down by category and by reason
async function get_summary(req, res, next) {
  try {
    const filter = build_filter(req.query);

    const totals = await WasteEntry.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total_loss: { $sum: "$total_monetary_loss" },
          total_quantity: { $sum: "$quantity_discarded" },
          entry_count: { $sum: 1 }
        }
      }
    ]);

    const by_category = await WasteEntry.aggregate([
      { $match: filter },
      { $group: { _id: "$category", total_loss: { $sum: "$total_monetary_loss" }, total_quantity: { $sum: "$quantity_discarded" } } },
      { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
      { $unwind: "$category" },
      { $project: { name: "$category.name", total_loss: 1, total_quantity: 1 } },
      { $sort: { total_loss: -1 } }
    ]);

    const by_reason = await WasteEntry.aggregate([
      { $match: filter },
      { $group: { _id: "$reason", total_loss: { $sum: "$total_monetary_loss" }, total_quantity: { $sum: "$quantity_discarded" } } },
      { $lookup: { from: "wastereasons", localField: "_id", foreignField: "_id", as: "reason" } },
      { $unwind: "$reason" },
      { $project: { name: "$reason.name", total_loss: 1, total_quantity: 1 } },
      { $sort: { total_loss: -1 } }
    ]);

    res.json({
      total_loss: totals[0]?.total_loss || 0,
      total_quantity: totals[0]?.total_quantity || 0,
      entry_count: totals[0]?.entry_count || 0,
      by_category,
      by_reason
    });
  } catch (error) {
    next(error);
  }
}

// Manager and Admin: top discarded items ranked by weight and by dollar loss
async function get_top_items(req, res, next) {
  try {
    const filter = build_filter(req.query);
    const limit = Number(req.query.limit) || 10;

    const by_weight = await WasteEntry.aggregate([
      { $match: filter },
      { $group: { _id: "$item_name", total_quantity: { $sum: "$quantity_discarded" }, total_loss: { $sum: "$total_monetary_loss" } } },
      { $sort: { total_quantity: -1 } },
      { $limit: limit }
    ]);

    const by_loss = await WasteEntry.aggregate([
      { $match: filter },
      { $group: { _id: "$item_name", total_quantity: { $sum: "$quantity_discarded" }, total_loss: { $sum: "$total_monetary_loss" } } },
      { $sort: { total_loss: -1 } },
      { $limit: limit }
    ]);

    res.json({ by_weight, by_loss });
  } catch (error) {
    next(error);
  }
}

// Manager and Admin: waste totals grouped by day, for the trend line chart
async function get_trends(req, res, next) {
  try {
    const filter = build_filter(req.query);

    const daily_totals = await WasteEntry.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total_loss: { $sum: "$total_monetary_loss" },
          total_quantity: { $sum: "$quantity_discarded" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(daily_totals);
  } catch (error) {
    next(error);
  }
}

module.exports = { get_summary, get_top_items, get_trends };
