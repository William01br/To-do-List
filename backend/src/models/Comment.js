import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Task from "./Task.js";

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Comment.belongsTo(Task);
Task.hasOne(Comment, {
  onDelete: "CASCADE",
});

export default Comment;
