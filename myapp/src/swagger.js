import swaggerJsDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ToDoList API Documentation",
      version: "1.0.0",
      description:
        "In this documentation you will be able to consult the API end-points and also test all available routes.",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

export const swaggerSpec = swaggerJsDoc(options);
