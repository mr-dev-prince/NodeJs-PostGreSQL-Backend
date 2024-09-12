// export const verifyEmail = async (req, res) => {
//   try {
//     const id = req.query?.id;

//     if (!id) {
//       return res
//         .status(400)
//         .json(ApiResponse.error(400, null, "User ID is required"));
//     }

//     const user = await User.findOne({ where: { id } });

//     if (!user) {
//       return res
//         .status(404)
//         .json(ApiResponse.error(404, null, "User not found"));
//     }

//     if (user.isEmailVerified) {
//       return res
//         .status(400)
//         .json(ApiResponse.error(400, null, "Email is already verified"));
//     }

//     const [numberOfRowsAffected, [updatedUser]] = await User.update(
//       { isEmailVerified: true },
//       {
//         where: { id },
//         returning: true,
//       }
//     );

//     if (numberOfRowsAffected === 0) {
//       return res
//         .status(400)
//         .json(ApiResponse.error(400, null, "No changes made"));
//     }

//     return res.send(`<!DOCTYPE html>
//                     <html lang="en">
//                     <head>
//                      <meta charset="UTF-8">
//                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                      <title>Verification Success</title>
//                         <style>
//                              body {
//       font-family: Arial, sans-serif;
//       background-color: #f4f4f4;
//       margin: 0;
//       padding: 0;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       height: 100vh;
//       animation: fadeIn 1s ease-out;
//     }

//     .container {
//       text-align: center;
//       background-color: #ffffff;
//       padding: 40px;
//       border-radius: 8px;
//       box-shadow: 0 0 20px rgba(0,0,0,0.1);
//       animation: slideIn 0.5s ease-out;
//     }

//     h1 {
//       color: #28a745;
//       margin-bottom: 20px;
//       font-size: 2em;
//       animation: bounce 1s ease-out;
//     }

//     p {
//       color: #555555;
//       font-size: 1.2em;
//       margin-bottom: 20px;
//     }

//     .button {
//       display: inline-block;
//       padding: 15px 30px;
//       font-size: 1em;
//       color: #ffffff;
//       background-color: #007bff;
//       text-decoration: none;
//       border-radius: 5px;
//       transition: background-color 0.3s ease;
//     }

//     .button:hover {
//       background-color: #0056b3;
//     }

//     @keyframes fadeIn {
//       from { opacity: 0; }
//       to { opacity: 1; }
//     }

//     @keyframes slideIn {
//       from { transform: translateY(-50px); opacity: 0; }
//       to { transform: translateY(0); opacity: 1; }
//     }

//     @keyframes bounce {
//       0%, 20%, 50%, 80%, 100% {
//         transform: translateY(0);
//       }
//       40% {
//         transform: translateY(-30px);
//       }
//       60% {
//         transform: translateY(-15px);
//       }
//     }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <h1>Congratulations!</h1>
//     <p>Your email has been successfully verified.</p>
//     <a href="/" class="button">Go to Homepage</a>
//   </div>

//   <script>
//     // Redirect after 5 seconds
//     setTimeout(() => {
//       window.location.href = "/";
//     }, 5000);
//   </script>
// </body>
// </html>`);
//   } catch (error) {
//     return res
//       .status(500)
//       .json(ApiResponse.error(500, error, "Failed to verify email"));
//   }
// };