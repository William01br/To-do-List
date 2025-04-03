import listService from "../services/listService.js";
import taskService from "../services/taskService.js";
import { sliceUrl } from "../utils/sliceString.js";

/**
 * @async
 * @function getAllDataPagination
 * @description Middleware para calcular a paginação de dados com base na requisição do usuário.
 *              Gera URLs para a próxima e a página anterior, além de definir o limite e o offset.
 *              Os dados de paginação são armazenados em `req.dataPagination` para uso posterior.
 *
 * @param {Object} req - Objeto de requisição do Express.
 * @param {string} req.userId - ID do usuário autenticado.
 * @param {string} [req.params.listId] - ID da lista (opcional).
 * @param {string} req.routePagination - Rota base para a paginação.
 * @param {Object} req.query - Parâmetros de consulta da URL.
 * @param {number} [req.query.limit] - Número máximo de itens por página (padrão: 10).
 * @param {number} [req.query.offset] - Número de itens a serem ignorados (padrão: 0).
 * @param {string} req.originalUrl - URL original da requisição.
 *
 * @param {Object} res - Objeto de resposta do Express.
 * @param {Function} next - Função de callback para passar o controle ao próximo middleware.
 *
 * @returns {void}
 *
 * @throws {Object} Retorna um erro 500 com uma mensagem se algo der errado.
 *
 * @example
 * // Exemplo de uso em uma rota do Express:
 * app.get('/data', getAllDataPagination, (req, res) => {
 *   const { nextUrl, previousUrl, limit, offset } = req.dataPagination;
 *   res.json({ nextUrl, previousUrl, limit, offset });
 * });
 */
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
    return res.status(500).json({ message: err.message });
  }
};

async function getAmount(route, id) {
  // this id should be "userId" or "listId".
  try {
    switch (route) {
      case "getAllLists":
        return await listService.getCountListsByUserId(id);
      case "getList-Task-ById":
        return await taskService.getCountTasksByListId(id);
      default:
        throw new Error("Invalid route");
    }
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}
