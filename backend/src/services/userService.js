import bcrypt from "bcrypt";
// import { sequelize } from "../config/database.js";

// const register = async (name, username, email, password) => {
//   try {
//     const avatarUrl =
//       "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

//     const passwordHashed = bcrypt.hash(password, 10);

//     const query =
//       "INSERT INTO users(name, username, email, password, avatar) VALUES ($1, $2, $3, $4, $5)";
//     const values = [name, username, email, passwordHashed, avatarUrl];

//     // Executa a inserção
//     const result = await sequelize.query(query, {
//       replacements: values,
//       type: sequelize.QueryTypes.INSERT,
//     });

//     console.log(result);

//     // returns result without password
//     const queryUserData =
//       "SELECT userId, name, username, email, avatar FROM users WHERE username = $1";
//     const userValue = [username];

//     return await sequelize.query(queryUserData, {
//       replacements: userValue,
//       type: sequelize.QueryTypes.SELECT,
//     });
//   } catch (err) {
//     console.error("Error registering user:", err);
//   }
// };

// export default { register };
