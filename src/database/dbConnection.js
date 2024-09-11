import { sequelize } from "./sequelizeInstance.js";

export const connectDb = async ()=>{
    try {
        await sequelize.authenticate();
        console.log("Connection to database established!!");
        await sequelize.sync({force:false})
    } catch (error) {
        console.log("Error while connecting to the database !!", error);
    }
}