"use strict";
const { Model, Op, Sequelize } = require("sequelize");


const today = new Date().toLocaleDateString("en-ca");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

   
  
    static dueToday(){
      return this.findAll({
        where:{
          dueDate: today
        }
      });
    }

    static overdue(){
      return this.findAll({
        where: {
            dueDate: {[Sequelize.Op.lt]: today}
        }
      })
    }

    static dueLater(){
      return this.findAll({
        where: {
          dueDate: {[Sequelize.Op.gt]: today}
        }
      })
    }

    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
