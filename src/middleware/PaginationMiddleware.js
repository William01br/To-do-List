import listService from "../services/listService.js";
import taskService from "../services/taskService.js";
import { sliceUrl } from "../utils/sliceString.js";

export const getAllDataPagination = async (req, res, next) => {
  try {
    const userId = req.userId;
    const listId = req.params.listId || null;
    const route = req.routePagination;
    let amount;

    if (!listId) {
      amount = await getAmount(route, userId);
    } else {
      amount = await getAmount(route, listId);
    }

    let { limit, offset } = req.query;

    limit = Number(limit) || 10;
    offset = Number(offset) || 0;

    const currentUrl = sliceUrl(req.originalUrl);

    const nextTotal = limit + offset;
    const nextUrl =
      nextTotal < amount
        ? `${currentUrl}?limit=${limit}&offset=${nextTotal}`
        : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousUrl =
      previous !== null
        ? `${currentUrl}?limit=${limit}&offset=${previous}`
        : null;

    req.dataPagination = {
      nextUrl: nextUrl,
      previousUrl: previousUrl,
      limit: limit,
      offset: offset,
    };
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

async function getAmount(route, id) {
  // this id should be "userId" or "listId".
  try {
    switch (route) {
      case "getAllLists":
        return await listService.getCountListsByUserId(id);
      case "getListById":
        return await taskService.getCountTasksByListId(id);
      case "routeTask":
        return await taskService.getCountTasksByListId(id);
      default:
        throw new Error("Invalid route");
    }
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}
