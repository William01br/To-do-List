import autocannon from "autocannon";
import axios from "axios";

let cookiesAcessAndRefresh = null;
let listId = null;
let taskId = null;

// function registerAccount() {
//   return new Promise((resolve, reject) => {
//     autocannon(
//       {
//         url: "http://localhost:3000/user/register",
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: "johndoe@example.com",
//           password: "SecurePassword123",
//         }),
//         connections: 1,
//         duration: 1,
//         onResponse: (status, body, headers, context) => {
//           if (status) console.log("status register:", status);
//         },
//       },
//       (err, result) => {
//         if (err) return reject(err);
//         console.log("autocannon: User registered successfully.");
//       }
//     );
//   });
// }

// function loginAndCaptureCookie() {
//   return new Promise((resolve, reject) => {
//     autocannon(
//       {
//         url: "http://localhost:3000/auth/login",
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: "johndoe@example.com",
//           password: "SecurePassword123",
//         }),
//         connections: 1,
//         duration: 1,
//         requests: [
//           {
//             onResponse: (status, body, context, headers) => {
//               if (headers["set-cookie"]) {
//                 cookiesAcessAndRefresh = headers["set-cookie"];
//               }

//               console.log("status login: " + status);
//               console.log(headers);
//             },
//           },
//         ],
//       },
//       (err, results) => {
//         console.log(results);
//         if (err) return reject(err);
//         resolve(cookiesAcessAndRefresh);
//       }
//     );
//   });
// }

async function getAuthCookies() {
  try {
    const response = await axios.post("http://localhost:3000/auth/login", {
      email: "johndoe@example.com",
      password: "SecurePassword123",
    });

    const cookies = response.headers["set-cookie"];

    return cookies;
  } catch (err) {
    console.error("Error logging in:", err.message);
    process.exit(1);
  }
}

async function getIdList(cookies) {
  try {
    const response = await axios.get("http://localhost:3000/lists/", {
      headers: { Cookie: cookies },
    });
    console.log(response.data);
    return response.data.data[1].list_id;
  } catch (err) {
    console.error("Error getting list id:", err.message);
    process.exit(1);
  }
}

async function runBenchmark() {
  // await registerAccount();
  // await loginAndCaptureCookie();
  const cookies = await getAuthCookies();
  const listId = await getIdList(cookies);

  console.log("Starting benchmark...");

  autocannon(
    {
      url: "http://localhost:3000",
      connections: 50,
      duration: 60,
      headers: {
        Cookie: cookies,
        "Content-Type": "application/json",
      },
      requests: [
        {
          method: "GET",
          path: "/lists/",
          onResponse: (status, body, headers, context) => {},
        },
        {
          method: "POST",
          path: "/lists/create",
          body: JSON.stringify({
            listName: "Movies to watch",
          }),
          onResponse: (status, body, headers, context) => {
            // console.log(body);
          },
        },
        {
          method: "GET",
          path: `/lists/${listId}`,
        },
        {
          method: "PATCH",
          path: `/lists/update/${listId}`,
          body: JSON.stringify({
            listName: "Movies to watch (updated)",
          }),
        },
        // {
        //   method: "DELETE",
        //   path: `/lists/${listId}`,
        // },
      ],
    },
    (err, results) => {
      if (err) return console.error("error:", err);
      console.log("Test report:");
      console.log(results);
      console.log("Benchmark finished.");
    }
  );
}

runBenchmark();
