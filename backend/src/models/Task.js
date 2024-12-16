import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import List from "./List.js";

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  completionDate: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
});

Task.belongsTo(List);
List.hasMany(Task, {
  onDelete: "CASCADE",
});

export default Task;
