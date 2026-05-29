import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE_NAME;
const APPOINTMENTS_TABLE = process.env.APPOINTMENTS_TABLE_NAME;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

const safeParseJson = (body) => {
  try {
    return body ? JSON.parse(body) : {};
  } catch (error) {
    console.error("PARSE ERROR:", error);
    throw new Error("Invalid JSON payload.");
  }
};

const normalizeRoute = (event) => {
  const queryType = event.queryStringParameters?.type;
  if (queryType) {
    return String(queryType).trim().toLowerCase();
  }

  const rawPath = String(event.rawPath || event.path || "/").trim();
  return rawPath.replace(/^\/+|\/+$/g, '').toLowerCase();
};

const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body)
});

const ensureTableNames = () => {
  if (!USERS_TABLE || !APPOINTMENTS_TABLE) {
    throw new Error("Missing USERS_TABLE_NAME or APPOINTMENTS_TABLE_NAME environment variable.");
  }
};

export const handler = async (event) => {
  console.log("FULL EVENT:", JSON.stringify(event, null, 2));

  try {
    ensureTableNames();

    const method = event.requestContext?.http?.method || event.httpMethod || "GET";
    const routeType = normalizeRoute(event);

    console.log("METHOD:", method);
    console.log("ROUTE TYPE:", routeType);

    if (method === "OPTIONS") {
      return buildResponse(200, "");
    }

    if (routeType === "users") {
      if (method === "GET") {
        const result = await docClient.send(
          new ScanCommand({ TableName: USERS_TABLE })
        );

        console.log("USER SCAN RESULT:", (result.Items || []).length);
        return buildResponse(200, result.Items || []);
      }

      if (method === "POST") {
        const body = safeParseJson(event.body || "{}");
        console.log("USER POST BODY:", body);

        if (body.action === "updateUser") {
          const { userId, updates } = body;
          if (!userId || !updates || typeof updates !== "object") {
            return buildResponse(400, { error: "Missing userId or updates for updateUser action." });
          }
          const scanResult = await docClient.send(
            new ScanCommand({
              TableName: USERS_TABLE,
              FilterExpression: "#idAttr = :userId OR #emailAttr = :userId",
              ExpressionAttributeNames: {
                "#idAttr": "id",
                "#emailAttr": "email"
              },
              ExpressionAttributeValues: {
                ":userId": userId
              }
            })
          );

          const existing = Array.isArray(scanResult.Items) ? scanResult.Items[0] : null;
          if (!existing) {
            return buildResponse(404, { error: "User not found." });
          }

          const updatedUser = {
            ...existing,
            ...updates
          };

          await docClient.send(
            new PutCommand({ TableName: USERS_TABLE, Item: updatedUser })
          );

          console.log("USER UPDATED:", updatedUser.id);
          return buildResponse(200, updatedUser);
        }

        const newUser = {
          id: body.id || `USR-${Date.now()}`,
          createdAt: body.createdAt || new Date().toISOString(),
          name: body.name || "",
          email: body.email || "",
          password: body.password || "",
          role: body.role || "Staff",
          active: body.active ?? true,
          createdBy: body.createdBy || "System",
          lastLoginAt: body.lastLoginAt || ""
        };

        await docClient.send(
          new PutCommand({ TableName: USERS_TABLE, Item: newUser })
        );

        console.log("USER CREATED:", newUser.id);
        return buildResponse(201, newUser);
      }
    }

    if (routeType === "appointments" || routeType === "" || routeType === "/") {
      if (method === "GET") {
        const result = await docClient.send(
          new ScanCommand({ TableName: APPOINTMENTS_TABLE })
        );

        console.log("APPOINTMENT SCAN RESULT:", (result.Items || []).length);
        return buildResponse(200, result.Items || []);
      }

      if (method === "POST") {
        const body = safeParseJson(event.body || "{}");
        console.log("APPOINTMENT POST BODY:", body);

        const newAppointment = {
          id: body.id || `APT-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...body
        };

        await docClient.send(
          new PutCommand({ TableName: APPOINTMENTS_TABLE, Item: newAppointment })
        );

        console.log("APPOINTMENT CREATED:", newAppointment.id);
        return buildResponse(201, newAppointment);
      }
    }

    return buildResponse(404, { error: "Route not found." });
  } catch (error) {
    console.error("LAMBDA ERROR:", error);
    return buildResponse(500, { error: error.message || "Internal server error." });
  }
};
