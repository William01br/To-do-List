import swaggerJsDoc from "swagger-jsdoc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ToDoList API Documentation",
      version: "1.0.0",
      description:
        "In this documentation you will be able to consult the API end-points and also test all available routes.",
    },
    components: {
      securitySchemes: {
        AccessToken: {
          type: "apikey",
          in: "cookie",
          name: "acessToken",
        },
        RefreshToken: {
          type: "apikey",
          in: "cookie",
          name: "refreshToken",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "number",
              example: 1,
            },
            username: {
              type: "string",
              example: "john_doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@test.com",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2023-10-01T12:00:00Z",
            },
            avatar: {
              type: "string",
              format: "https://exampleAvatar.png",
            },
            // lists: {
            //   type: "array",
            //   items: {
            //     $ref: "#/components/schemas/List",
            //   },
            // },
          },
        },
        List: {
          type: "object",
          properties: {
            id: {
              type: "number",
              example: 1,
            },
            list_name: {
              type: "string",
              example: "default list",
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2023-10-01T12:00:00Z",
            },
            // tasks: {
            //   type: "array",
            //   items: {
            //     $ref: "#/components/schemas/Task",
            //   },
            // },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: {
              type: "number",
              example: 1,
            },
            name_task: {
              type: "string",
              example: "read",
            },
            completed: {
              type: "boolean",
              example: false,
            },
            due_date: {
              type: "string",
              format: "date-time",
              example: "2025-03-01T12:00:00Z",
            },
            comment: {
              type: "string",
              example: "read all books of Dune",
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2025-01-01T12:00:00Z",
            },
            list_id: {
              type: "number",
              example: 1,
            },
          },
        },
      },
    },
    security: [
      {
        AccessToken: [],
        RefreshToken: [],
      },
    ],
  },
  apis: [`${_dirname}/../routes/*.js`],
};

const swaggerSpec = swaggerJsDoc(options);
// console.log(JSON.stringify(swaggerSpec, null, 2));

export default swaggerSpec;
