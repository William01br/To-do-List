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
} from "../controllers/taskController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Route handler to fetch all lists for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 * It calls the `getAllLists` function to retrieve all lists associated with the authenticated user.
 *
 * @name Get All Lists
 * @route {GET} /
 * @middleware {Function} authenticateToken - Middleware to verify the user's authentication token.
 * @handler {Function} getAllLists - The controller function to fetch all lists.
 * @returns {Object} A JSON response containing the lists or an error message.
 */
router.get("/", authenticateToken, getAllLists);

/**
 * Route handler to fetch a specific list by its ID for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 * It calls the `getListByListId` function to retrieve a specific list associated with the authenticated user.
 *
 * @name Get List by ID
 * @route {GET} /:listId
 * @middleware {Function} authenticateToken - Middleware to verify the user's authentication token.
 * @handler {Function} getListByListId - The controller function to fetch a specific list by its ID.
 * @param {string} listId - The ID of the list to retrieve (provided as a URL parameter).
 * @returns {Object} A JSON response containing the list or an error message.
 */
router.get("/:listId", authenticateToken, getListByListId);

/**
 * Route handler to create a new list for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 * It calls the `createList` function to create a new list associated with the authenticated user.
 *
 * @name Create List
 * @route {POST} /create
 * @middleware {Function} authenticateToken - Middleware to verify the user's authentication token.
 * @handler {Function} createList - The controller function to create a new list.
 * @returns {Object} A JSON response containing the created list or an error message.
 */
router.post("/create", authenticateToken, createList);

/**
 * Route handler to update an existing list for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 * It calls the `updateList` function to update a specific list associated with the authenticated user.
 *
 * @name Update List
 * @route {PATCH} /update/:listId
 * @middleware {Function} authenticateToken - Middleware to verify the user's authentication token.
 * @handler {Function} updateList - The controller function to update an existing list.
 * @param {string} listId - The ID of the list to update (provided as a URL parameter).
 * @returns {Object} A JSON response containing the updated list or an error message.
 */
router.patch("/update/:listId", authenticateToken, updateList);

/**
 * Route handler to delete an existing list for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 * It calls the `deleteList` function to delete a specific list associated with the authenticated user.
 *
 * @name Delete List
 * @route {DELETE} /remove/:listId
 * @middleware {Function} authenticateToken - Middleware to verify the user's authentication token.
 * @handler {Function} deleteList - The controller function to delete an existing list.
 * @param {string} listId - The ID of the list to delete (provided as a URL parameter).
 * @returns {Object} A JSON response indicating the result of the operation or an error message.
 */
router.delete("/remove/:listId", authenticateToken, deleteList);

/*
 * Routes for tasks
 */

/**
 * Route handler to fetch all tasks for a specific list for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 * It calls the `getAllTasks` function to retrieve all tasks associated with a specific list and the authenticated user.
 *
 * @name Get All Tasks for a List
 * @route {GET} /:listId/tasks
 * @middleware {Function} authenticateToken - Middleware to verify the user's authentication token.
 * @handler {Function} getAllTasks - The controller function to fetch all tasks for a specific list.
 * @param {string} listId - The ID of the list for which tasks are to be retrieved (provided as a URL parameter).
 * @returns {Object} A JSON response containing the tasks or an error message.
 */
router.get("/:listId/tasks", authenticateToken, getAllTasks);

/**
 * Route handler to fetch a specific task by its ID within a specific list for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 * It calls the `getTaskByTaskId` function to retrieve a specific task associated with a specific list and the authenticated user.
 *
 * @name Get Task by ID
 * @route {GET} /:listId/tasks/:taskId
 * @middleware {Function} authenticateToken - Middleware to verify the user's authentication token.
 * @handler {Function} getTaskByTaskId - The controller function to fetch a specific task by its ID.
 * @param {string} listId - The ID of the list to which the task belongs (provided as a URL parameter
 * @param {string} taskId - The ID of the task to retrieve (provided as a URL parameter).
 * @returns {Object} A JSON response containing the task or an error message.
 */
router.get("/:listId/tasks/:taskId", authenticateToken, getTaskByTaskId);

/**
 * Route handler to create a new task within a specific list for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 * It calls the `createTask` function to create a new task associated with a specific list and the authenticated user.
 *
 * @name Create Task
 * @route {POST} /:listId/tasks
 * @middleware {Function} authenticateToken - Middleware to verify the user's authentication token.
 * @handler {Function} createTask - The controller function to create a new task.
 * @param {string} listId - The ID of the list to which the task belongs (provided as a URL parameter).
 * @returns {Object} A JSON response containing the created task or an error message.
 */
router.post("/:listId/tasks", authenticateToken, createTask);

/**
 * Route handler to update a specific task within a specific list for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 * It calls the `updateTask` function to update a specific task associated with a specific list and the authenticated user.
 *
 * @name Update Task
 * @route {PATCH} /:listId/tasks/:taskId
 * @middleware {Function} authenticateToken - Middleware to verify the user's authentication token.
 * @handler {Function} updateTask - The controller function to update a specific task.
 * @param {string} listId - The ID of the list to which the task belongs (provided as a URL parameter).
 * @param {string} taskId - The ID of the task to update (provided as a URL parameter).
 * @returns {Object} A JSON response containing the updated task or an error message.
 */
router.patch("/:listId/tasks/:taskId", authenticateToken, updateTask);

/**
 * Route handler to delete a specific task within a specific list for the authenticated user.
 *
 * This route requires authentication via the `authenticateToken` middleware.
 * It calls the `deleteTask` function to delete a specific task associated with a specific list and the authenticated user.
 *
 * @name Delete Task
 * @route {DELETE} /:listId/tasks/:taskId
 * @middleware {Function} authenticateToken - Middleware to verify the user's authentication token.
 * @handler {Function} deleteTask - The controller function to delete a specific task.
 * @param {string} listId - The ID of the list to which the task belongs (provided as a URL parameter).
 * @param {string} taskId - The ID of the task to delete (provided as a URL parameter).
 * @returns {Object} A JSON response indicating the result of the operation or an error message.
 */
router.delete("/:listId/tasks/:taskId", authenticateToken, deleteTask);

export default router;
