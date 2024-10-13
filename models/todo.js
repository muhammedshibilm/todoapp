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

   
  
    static async dueToday(){
      return this.findAll({
        where:{
          dueDate: today
        }
      });
    }

    static async overdue(){
      return this.findAll({
        where: {
            dueDate: {[Sequelize.Op.lt]: today}
        }
      })
    }

    static async dueLater(){
      return this.findAll({
        where: {
          dueDate: {[Sequelize.Op.gt]: today}
        }
      })
    }

    static async addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    async setCompletionStatus() {
      return this.update({ completed: true });
    }
   
   static async deleteTodo(id){
    return this.destroy({
      where: {
        id,
      }
    })
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
