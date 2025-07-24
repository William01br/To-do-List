/**
 * Route handler to fetch all lists and tasks for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 */

import express from "express";

import {
  createList,
  getAllLists,
  getListByListId,
  updateList,
  deleteList,
} from "../controllers/listController.js";
import {
  getAllTasks,
  createTask,
  getTaskByTaskId,
  updateTask,
  deleteTask,
  setTaskCompleted,
} from "../controllers/taskController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import { getAllDataPagination } from "../middleware/PaginationMiddleware.js";
import { validateId } from "../middleware/validateId.js";

const router = express.Router();

/**
 * @swagger
 * /lists/:
 *   get:
 *     summary: Retrieve all lists for the authenticated user
 *     description: >
 *       This endpoint retrieves all lists associated with the authenticated user.
 *       The authentication is performed via an access token sent in a signed cookie.
 *     tags:
 *       - List
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page.
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip.
 *     responses:
 *       200:
 *         description: Successfully retrieved the lists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: "#/components/schemas/List"
 *       401:
 *         description: Unauthorized - Access token not found or expired.
 *       403:
 *         description: Forbidden - Invalid token signature.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/",
  authenticateToken,
  (req, res, next) => {
    req.routePagination = "getAllLists";
    next();
  },
  getAllDataPagination,
  getAllLists
);

/**
 * @swagger
 * /lists/{listId}:
 *   get:
 *     summary: Retrieve a specific list by its ID
 *     description: >
 *       This endpoint retrieves a list by its ID for the authenticated user.
 *       Authentication is done via an access token sent in a signed cookie.
 *     tags:
 *       - List
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the list to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page.
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       400:
 *         description: Bad request - List ID is required.
 *       401:
 *         description: Unauthorized - Access token not found or expired.
 *       403:
 *         description: Forbidden - Invalid token signature.
 *       404:
 *         description: List not found.
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/:listId",
  authenticateToken,
  (req, res, next) => {
    validateId(req.params.listId);
    req.routePagination = "getList-Task-ById";
    next();
  },
  getAllDataPagination,
  getListByListId
);

/**
 * @swagger
 * /lists/create:
 *   post:
 *     summary: Create a new list
 *     description: >
 *       This endpoint allows an authenticated user to create a new list.
 *       Authentication is done via an access token sent in a signed cookie.
 *     tags:
 *       - List
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listName
 *             properties:
 *               listName:
 *                 type: string
 *                 example: "Movies to watch"
 *     responses:
 *       200:
 *         description: Successfully created the list.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       400:
 *         description: Bad request - List name is required.
 *       401:
 *         description: Unauthorized - Access token not found or expired.
 *       403:
 *         description: Forbidden - Invalid token signature.
 *       500:
 *         description: Internal server error.
 */
router.post("/create", authenticateToken, createList);

/**
 * @swagger
 * /lists/update/{listId}:
 *   patch:
 *     summary: Update a list by ID
 *     description: >
 *       This endpoint allows an authenticated user to update a list's name.
 *       Authentication is required via an access token sent in a signed cookie.
 *     tags:
 *       - List
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the list to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listName
 *             properties:
 *               listName:
 *                 type: string
 *                 example: "new name"
 *     responses:
 *       200:
 *         description: List updated successfully.
 *       400:
 *         description: Bad request - List ID or name is missing.
 *       401:
 *         description: Unauthorized - Access token not found or expired.
 *       403:
 *         description: Forbidden - Invalid token signature.
 *       404:
 *         description: Not found - List does not exist.
 *       500:
 *         description: Internal server error.
 */
router.patch(
  "/update/:listId",
  (req, res, next) => {
    validateId(req.params.listId);
    next();
  },
  authenticateToken,
  updateList
);

/**
 * @swagger
 * /lists/remove/{listId}:
 *   delete:
 *     summary: Delete a list by ID
 *     description: >
 *       This endpoint allows an authenticated user to delete a list.
 *       Authentication is required via an access token sent in a signed cookie.
 *     tags:
 *       - List
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the list to delete.
 *     responses:
 *       200:
 *         description: List deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "List deleted successfully"
 *       400:
 *         description: Bad request - List ID is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "List Id is required"
 *       401:
 *         description: Unauthorized - Access token not found or expired.
 *       403:
 *         description: Forbidden - Invalid token signature.
 *       404:
 *         description: Not found - List does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "List not found. Nothing was deleted"
 *       500:
 *         description: Internal server error.
 */
router.delete(
  "/remove/:listId",
  (req, res, next) => {
    validateId(req.params.listId);
    next();
  },
  authenticateToken,
  deleteList
);

/*
 * Routes for tasks
 */

/**
 * @swagger
 * /lists/{listId}/tasks:
 *   get:
 *     summary: Get all tasks from a list
 *     description: >
 *       This endpoint retrieves all tasks associated with a given list ID.
 *       Authentication is required via an access token sent in a signed cookie.
 *     tags:
 *       - Task
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the list whose tasks are being retrieved.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page.
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip.
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Task"
 *                 message:
 *                   type: string
 *                   example: "There are no tasks"
 *       400:
 *         description: Bad request - List ID is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "List Id is required"
 *       401:
 *         description: Unauthorized - Access token not found or expired.
 *       403:
 *         description: Forbidden - Invalid token signature.
 *       404:
 *         description: Not found - List does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "List not found"
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/:listId/tasks",
  authenticateToken,
  (req, res, next) => {
    validateId(req.params.listId);
    req.routePagination = "getList-Task-ById";
    next();
  },
  getAllDataPagination,
  getAllTasks
);

/**
 * @swagger
 * /lists/{listId}/tasks/{taskId}:
 *   get:
 *     summary: Get a task by its ID
 *     description: >
 *       This endpoint retrieves a specific task by its ID from a specified list.
 *       Authentication is required via an access token sent in a signed cookie.
 *     tags:
 *       - Task
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the list containing the task.
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the task to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the task.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: "#/components/schemas/Task"
 *       400:
 *         description: Bad request - Missing required parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ListId and TaskId are required"
 *       401:
 *         description: Unauthorized - Access token not found or expired.
 *       403:
 *         description: Forbidden - Invalid token signature.
 *       404:
 *         description: Not found - List or task does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task not found"
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/:listId/tasks/:taskId",
  (req, res, next) => {
    validateId(req.params.listId, req.params.taskId);
    next();
  },
  authenticateToken,
  getTaskByTaskId
);

/**
 * @swagger
 * /lists/{listId}/tasks:
 *   post:
 *     summary: Create a new task in a list
 *     description: >
 *       This endpoint allows users to create a new task in a specified list.
 *       Authentication is required via an access token sent in a signed cookie.
 *     tags:
 *       - Task
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the list where the task will be created.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nameTask
 *               - comment
 *               - dueDate
 *             properties:
 *               nameTask:
 *                 type: string
 *                 description: The name of the task.
 *                 example: "Buy groceries"
 *               comment:
 *                 type: string
 *                 description: Additional comment or note for the task.
 *                 example: "Remember to buy milk and eggs"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: The due date for the task.
 *                 example: "2025-03-10"
 *     responses:
 *       200:
 *         description: Successfully created the task.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: "#/components/schemas/Task"
 *       400:
 *         description: Bad request - Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All fields are required"
 *       401:
 *         description: Unauthorized - Access token not found or expired.
 *       403:
 *         description: Forbidden - Invalid token signature.
 *       404:
 *         description: Not found - List does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "List not found"
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/:listId/tasks",
  (req, res, next) => {
    validateId(req.params.listId);
    next();
  },
  authenticateToken,
  createTask
);

/**
 * @swagger
 * /lists/{listId}/tasks/{taskId}:
 *   patch:
 *     summary: Update a task by its ID
 *     description: >
 *       Updates one or more fields of a specific task within a list.
 *       Authentication is required via an access token sent in a signed cookie.
 *     tags:
 *       - Task
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the list containing the task.
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the task to update.
 *     requestBody:
 *       description: JSON object containing the fields to update.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nameTask:
 *                 type: string
 *                 description: The updated name of the task.
 *                 example: "New task name"
 *               comment:
 *                 type: string
 *                 description: The updated comment for the task.
 *                 example: "Updated task comment"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: The updated due date for the task.
 *                 example: "2025-03-10"
 *               completed:
 *                 type: boolean
 *                 description: Marks the task as completed or not.
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully updated the task.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task updated successfully"
 *       400:
 *         description: Bad request - Missing required parameters or no fields to update.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Is required update one field, at least"
 *       401:
 *         description: Unauthorized - Access token not found or expired.
 *       403:
 *         description: Forbidden - Invalid token signature.
 *       404:
 *         description: Not found - List or task does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task not found"
 *       500:
 *         description: Internal server error.
 */
router.patch(
  "/:listId/tasks/:taskId",
  (req, res, next) => {
    validateId(req.params.listId, req.params.taskId);
    next();
  },
  authenticateToken,
  updateTask
);

/**
 * @swagger
 * /lists/{listId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task by its ID
 *     description: >
 *       Deletes a specific task within a list.
 *       Authentication is required via an access token sent in a signed cookie.
 *     tags:
 *       - Task
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the list containing the task.
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the task to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted the task.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task deleted successfully"
 *       400:
 *         description: Bad request - Missing required parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ListId and TaskId are required"
 *       401:
 *         description: Unauthorized - Access token not found or expired.
 *       403:
 *         description: Forbidden - Invalid token signature.
 *       404:
 *         description: Not found - List or task does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task not found. Nothing was deleted"
 *       500:
 *         description: Internal server error.
 */
router.delete(
  "/:listId/tasks/:taskId",
  (req, res, next) => {
    validateId(req.params.listId, req.params.taskId);
    next();
  },
  authenticateToken,
  deleteTask
);

router.patch(
  "/:listId/tasks/:taskId/check",
  (req, res, next) => {
    validateId(req.params.listId, req.params.taskId);
    next();
  },
  authenticateToken,
  setTaskCompleted
);

export default router;
