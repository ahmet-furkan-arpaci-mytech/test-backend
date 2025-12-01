import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";

const controllerGlobs = [
  path.join(__dirname, "controllers", "*.js"),
  path.join(process.cwd(), "src", "presentation", "controllers", "*.ts"),
];

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Test Backend API",
      version: "1.0.0",
      description: "Auto-generated Swagger documentation for the news backend.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],
    components: {
      schemas: {
        UserRegistration: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
          },
          required: ["name", "email", "password"],
        },
        UserAuthentication: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
          required: ["email", "password"],
        },
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            user: { $ref: "#/components/schemas/UserResponse" },
          },
        },
        CreateCategory: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            colorCode: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
          },
          required: ["name", "description", "colorCode", "imageUrl"],
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            colorCode: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
          },
        },
        CategoryWithNews: {
          type: "object",
          properties: {
            category: { $ref: "#/components/schemas/Category" },
            news: {
              type: "array",
              items: { $ref: "#/components/schemas/News" },
            },
          },
        },
        PaginatedCategoriesWithNews: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CategoryWithNews" },
            },
            total: { type: "number" },
            page: { type: "number" },
            pageSize: { type: "number" },
          },
        },
        CreateNews: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
            categoryId: { type: "string" },
            publishedAt: { type: "string", format: "date-time" },
            isLatest: { type: "boolean" },
            isPopular: { type: "boolean" },
            sourceId: { type: "string" },
          },
          required: ["title", "content", "categoryId", "sourceId"],
        },
        News: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
            categoryId: { type: "string" },
            sourceId: { type: "string" },
            publishedAt: { type: "string", format: "date-time" },
            isLatest: { type: "boolean" },
            isPopular: { type: "boolean" },
            sourceName: { type: "string" },
            categoryName: { type: "string" },
          },
        },
        TwitterAccount: {
          type: "object",
          properties: {
            id: { type: "string" },
            handle: { type: "string" },
            displayName: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
            bio: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Tweet: {
          type: "object",
          properties: {
            id: { type: "string" },
            accountId: { type: "string" },
            accountName: { type: "string" },
            accountImageUrl: { type: "string", format: "uri" },
            content: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            isPopular: { type: "boolean" },
          },
        },
        PaginatedNews: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/News" },
            },
            total: { type: "number" },
            page: { type: "number" },
            pageSize: { type: "number" },
          },
        },
        PaginatedTwitterAccounts: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/TwitterAccount" },
            },
            total: { type: "number" },
            page: { type: "number" },
            pageSize: { type: "number" },
          },
        },
        PaginatedTweets: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/Tweet" },
            },
            total: { type: "number" },
            page: { type: "number" },
            pageSize: { type: "number" },
          },
        },
        SaveNewsRequest: {
          type: "object",
          properties: {
            userId: { type: "string" },
            newsId: { type: "string" },
          },
          required: ["userId", "newsId"],
        },
        SavedNewsResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            newsId: { type: "string" },
            savedAt: { type: "string", format: "date-time" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            result: { type: ["object", "null"] },
          },
        },
        MyFollowedSourcesUpdate: {
          type: "object",
          properties: {
            sourceIds: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["sourceIds"],
        },
        Source: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
            sourceCategoryId: { type: "string" },
          },
        },
        SourcesResponse: {
          type: "object",
          properties: {
            sources: {
              type: "array",
              items: { $ref: "#/components/schemas/Source" },
            },
          },
        },
        FollowedSource: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
          },
        },
        FollowedSourcesResponse: {
          type: "object",
          properties: {
            sources: {
              type: "array",
              items: { $ref: "#/components/schemas/FollowedSource" },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            result: { type: ["object", "null"] },
            errorCode: { type: "number" },
          },
        },
      },
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: controllerGlobs,
};

export const swaggerSpec = swaggerJsdoc(options);
