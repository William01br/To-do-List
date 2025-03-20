import autocannon from "autocannon";
import axios from "axios";

async function registerUser() {
  try {
    await axios.post("http://localhost:3001/user/register", {
      username: "John Doe",
      email: "johndoe@example.com",
      password: "SecurePassword123",
    });
  } catch (err) {
    console.error("Error registering user:", err.message);
    process.exit(1);
  }
}

async function getAuthCookies() {
  try {
    const response = await axios.post("http://localhost:3001/auth/login", {
      email: "johndoe@example.com",
      password: "SecurePassword123",
    });

    const cookies = response.headers["set-cookie"];
    console.log(cookies);

    return cookies;
  } catch (err) {
    console.error("Error logging in:", err.message);
    process.exit(1);
  }
}

async function getIdList(cookies) {
  try {
    const response = await axios.get("http://localhost:3001/lists/", {
      headers: { Cookie: cookies },
    });
    return response.data.data[1].list_id;
  } catch (err) {
    console.error("Error getting list id:", err.message);
    process.exit(1);
  }
}

async function runBenchmark() {
  // await registerUser();
  const cookies = await getAuthCookies();
  const listId = await getIdList(cookies);

  console.log("Starting benchmark...");

  autocannon(
    {
      url: "http://localhost:3001",
      connections: 50,
      duration: 60,
      headers: {
        Cookie: cookies,
        "Content-Type": "application/json",
      },
      requests: [
        {
          method: "POST",
          path: "/auth/login",
          body: JSON.stringify({
            email: "johndoe@example.com",
            password: "SecurePassword123",
          }),
          // headers: {
          //   cookie: cookies,
          // },
        },
        {
          method: "GET",
          path: "/user/",
        },
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
