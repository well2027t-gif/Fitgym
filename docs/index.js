// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  })
  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  base: "/Fitgym/",
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/personalApi.ts
import { z as z2 } from "zod";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var usingForgeApi = () => Boolean(ENV.forgeApiKey && ENV.forgeApiKey.trim().length > 0);
var resolveApiUrl = () => {
  if (usingForgeApi()) {
    return ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
  }
  return "https://api.openai.com/v1/chat/completions";
};
var assertApiKey = () => {
  if (!ENV.forgeApiKey && !process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: usingForgeApi() ? "gemini-2.5-flash" : "gpt-4.1-mini",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  if (usingForgeApi()) {
    payload.thinking = {
      budget_tokens: 128
    };
  }
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey || process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/personalApi.ts
var objectiveSchema = z2.enum(["hipertrofia", "emagrecimento", "definicao"]);
var levelSchema = z2.enum(["iniciante", "intermediario", "avancado"]);
var personalUserSchema = z2.object({
  idade: z2.number().int().min(12).max(100),
  peso: z2.number().min(30).max(350),
  altura: z2.number().min(120).max(240),
  objetivo: objectiveSchema,
  nivel: levelSchema,
  frequencia: z2.number().int().min(1).max(7),
  restricoes: z2.string().max(1200).default(""),
  historico: z2.array(z2.string()).default([]),
  fotos: z2.array(z2.string()).default([])
});
var exerciseSchema = z2.object({
  nome: z2.string().min(1),
  series: z2.number().int().min(3).max(5),
  repeticoes: z2.string().min(1),
  descanso: z2.string().min(1),
  observacao: z2.string().min(1)
});
var generatedPlanSchema = z2.object({
  treino: z2.object({
    divisao: z2.string().min(1),
    nivel_intensidade: z2.string().min(1),
    dias: z2.array(z2.object({
      dia: z2.string().min(1),
      foco: z2.string().min(1),
      exercicios: z2.array(exerciseSchema).min(1).max(6)
    })).min(1).max(7)
  }),
  dieta: z2.object({
    calorias_estimadas: z2.number().min(1200).max(8e3),
    macros: z2.object({
      proteina: z2.string().min(1),
      carboidrato: z2.string().min(1),
      gordura: z2.string().min(1)
    }),
    refeicoes: z2.array(z2.union([
      z2.string().min(1),
      z2.object({
        nome: z2.string().min(1),
        alimentos: z2.array(z2.string()).default([]),
        observacao: z2.string().optional()
      })
    ])).min(1)
  }),
  progresso: z2.record(z2.string(), z2.any()).default({}),
  observacoes_gerais: z2.array(z2.string()).default([])
});
var photoAnalysisSchema = z2.object({
  analise: z2.object({
    gordura_corporal: z2.string().min(1),
    massa_muscular: z2.string().min(1),
    pontos_fortes: z2.array(z2.string()).default([]),
    pontos_fracos: z2.array(z2.string()).default([])
  }),
  recomendacoes: z2.array(z2.string()).default([]),
  observacao: z2.string().min(1)
});
var progressEvaluationSchema = z2.object({
  status: z2.enum(["evoluindo", "estagnado", "regredindo"]),
  ajustes: z2.object({
    carga: z2.string().min(1),
    intensidade: z2.string().min(1),
    cardio: z2.string().min(1)
  }),
  recomendacoes: z2.array(z2.string()).default([]),
  necessita_novo_plano: z2.boolean()
});
var generatePlanInputSchema = z2.object({
  usuario: personalUserSchema
});
var adjustPlanInputSchema = z2.object({
  usuario: personalUserSchema,
  planoAtual: generatedPlanSchema,
  feedback: z2.string().min(3).max(2500)
});
var chatMessageSchema = z2.object({
  role: z2.enum(["system", "user", "assistant"]),
  content: z2.string().min(1).max(12e3)
});
var chatInputSchema = z2.object({
  usuario: personalUserSchema,
  historico: z2.array(chatMessageSchema).max(30).default([]),
  mensagem: z2.string().min(1).max(4e3),
  planoAtual: generatedPlanSchema.optional(),
  imageDataUrl: z2.string().optional()
});
var analyzePhotoInputSchema = z2.object({
  usuario: personalUserSchema,
  imageDataUrl: z2.string().min(32)
});
var workoutHistoryItemSchema = z2.object({
  date: z2.string().min(1),
  workoutName: z2.string().min(1),
  durationSeconds: z2.number().min(0),
  completedExercises: z2.number().int().min(0)
});
var progressInputSchema = z2.object({
  usuario: personalUserSchema,
  historicoTreinos: z2.array(workoutHistoryItemSchema).default([]),
  pesoAtual: z2.number().min(30).max(350),
  feedback: z2.string().min(3).max(2500)
});
function jsonResponse(res, status, body) {
  res.status(status).json(body);
}
function sanitizeJsonString(content) {
  const trimmed = content.trim();
  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}
function extractAssistantText(result) {
  const content = result.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((part) => part.type === "text" ? part.text : "").join("\n").trim();
  }
  return "";
}
async function invokeStructuredJson(messages, schema) {
  const result = await invokeLLM({
    messages,
    responseFormat: { type: "json_object" }
  });
  const text2 = extractAssistantText(result);
  const parsed = JSON.parse(sanitizeJsonString(text2));
  return schema.parse(parsed);
}
function buildCoreSystemPrompt() {
  return [
    "Voc\xEA \xE9 uma IA profissional que atua como PERSONAL TRAINER, NUTRICIONISTA ESPORTIVO e COACH DE EVOLU\xC7\xC3O.",
    "Seja profissional, direta, motivadora, objetiva e adapt\xE1vel ao usu\xE1rio.",
    "Nunca recomende subst\xE2ncias, anabolizantes, horm\xF4nios ou condutas ilegais.",
    "Nunca d\xEA diagn\xF3stico m\xE9dico e nunca trate an\xE1lise visual como certeza absoluta.",
    "Evite extremos, respeite o n\xEDvel do usu\xE1rio e reduza risco de overtraining.",
    "Toda resposta estruturada deve ser JSON puro, v\xE1lido, sem markdown e sem texto fora do JSON.",
    "Treino: m\xE1ximo de 6 exerc\xEDcios por treino, entre 3 e 5 s\xE9ries, incluir descanso e progress\xE3o de carga.",
    "Dieta: nunca abaixo de 1200 kcal, usar alimentos simples, distribui\xE7\xE3o equilibrada e adequada ao objetivo."
  ].join(" ");
}
function buildPlanPrompt(usuario) {
  return [
    "Gere um plano inicial completo de treino e dieta seguindo estritamente o formato solicitado.",
    "Mantenha linguagem t\xE9cnica, por\xE9m simples.",
    "No campo progresso, traga metas pr\xE1ticas para 4 semanas.",
    "Nas observacoes_gerais, liste alertas de execu\xE7\xE3o, hidrata\xE7\xE3o, sono e recupera\xE7\xE3o.",
    `Dados do usu\xE1rio: ${JSON.stringify(usuario)}`,
    "Formato obrigat\xF3rio:",
    JSON.stringify({
      treino: {
        divisao: "",
        nivel_intensidade: "",
        dias: [
          {
            dia: "",
            foco: "",
            exercicios: [
              {
                nome: "",
                series: 3,
                repeticoes: "",
                descanso: "",
                observacao: ""
              }
            ]
          }
        ]
      },
      dieta: {
        calorias_estimadas: 0,
        macros: {
          proteina: "",
          carboidrato: "",
          gordura: ""
        },
        refeicoes: []
      },
      progresso: {},
      observacoes_gerais: []
    })
  ].join("\n");
}
function buildAdjustmentPrompt(input) {
  return [
    "Ajuste o plano atual usando o feedback recebido.",
    "Mantenha o mesmo formato JSON obrigat\xF3rio.",
    "Se o feedback indicar dificuldade, reduza volume, intensidade ou complexidade quando apropriado.",
    `Usu\xE1rio: ${JSON.stringify(input.usuario)}`,
    `Plano atual: ${JSON.stringify(input.planoAtual)}`,
    `Feedback: ${input.feedback}`
  ].join("\n");
}
function buildChatPrompt(input) {
  const planContext = input.planoAtual ? `Plano atual: ${JSON.stringify(input.planoAtual)}` : "Plano atual: ainda n\xE3o gerado.";
  return [
    buildCoreSystemPrompt(),
    "Responda em portugu\xEAs do Brasil.",
    "Se houver imagem, use-a apenas como apoio contextual e deixe claro que qualquer percep\xE7\xE3o visual \xE9 estimativa.",
    "Responda de forma objetiva, \xFAtil e humana, em no m\xE1ximo 8 par\xE1grafos curtos.",
    `Dados do usu\xE1rio: ${JSON.stringify(input.usuario)}`,
    planContext
  ].join("\n");
}
function buildPhotoPrompt(usuario) {
  return [
    "Analise visualmente a foto corporal com cautela e sempre em linguagem de estimativa.",
    "N\xE3o afirme diagn\xF3sticos, n\xE3o use certeza absoluta e n\xE3o invente medi\xE7\xF5es cl\xEDnicas.",
    "Retorne JSON puro exatamente no formato solicitado com estimativas prudentes.",
    `Dados do usu\xE1rio: ${JSON.stringify(usuario)}`,
    "Observa\xE7\xE3o obrigat\xF3ria: deixar claro que a an\xE1lise \xE9 baseada em estimativa visual."
  ].join("\n");
}
function buildProgressPrompt(input) {
  return [
    "Avalie a evolu\xE7\xE3o do usu\xE1rio com base no hist\xF3rico, peso atual e feedback informado.",
    "Classifique como evoluindo, estagnado ou regredindo.",
    "Proponha ajustes pr\xE1ticos em carga, intensidade e cardio.",
    "Indique se necessita_novo_plano deve ser true ou false.",
    `Dados do usu\xE1rio: ${JSON.stringify(input.usuario)}`,
    `Hist\xF3rico de treinos: ${JSON.stringify(input.historicoTreinos)}`,
    `Peso atual: ${input.pesoAtual}`,
    `Feedback: ${input.feedback}`
  ].join("\n");
}
async function handleGeneratePlan(req, res) {
  try {
    const input = generatePlanInputSchema.parse(req.body);
    const data = await invokeStructuredJson(
      [
        { role: "system", content: buildCoreSystemPrompt() },
        { role: "user", content: buildPlanPrompt(input.usuario) }
      ],
      generatedPlanSchema
    );
    jsonResponse(res, 200, data);
  } catch (error) {
    handleError(res, error);
  }
}
async function handleAdjustPlan(req, res) {
  try {
    const input = adjustPlanInputSchema.parse(req.body);
    const data = await invokeStructuredJson(
      [
        { role: "system", content: buildCoreSystemPrompt() },
        { role: "user", content: buildAdjustmentPrompt(input) }
      ],
      generatedPlanSchema
    );
    jsonResponse(res, 200, data);
  } catch (error) {
    handleError(res, error);
  }
}
async function handleChatPersonal(req, res) {
  try {
    const input = chatInputSchema.parse(req.body);
    const messages = [
      { role: "system", content: buildChatPrompt(input) },
      ...input.historico.map((message) => ({ role: message.role, content: message.content })),
      input.imageDataUrl ? {
        role: "user",
        content: [
          { type: "text", text: input.mensagem },
          { type: "image_url", image_url: { url: input.imageDataUrl, detail: "low" } }
        ]
      } : { role: "user", content: input.mensagem }
    ];
    const result = await invokeLLM({ messages });
    const resposta = extractAssistantText(result).trim();
    jsonResponse(res, 200, {
      resposta,
      historico: [
        ...input.historico,
        { role: "user", content: input.imageDataUrl ? `${input.mensagem}
[imagem enviada]` : input.mensagem },
        { role: "assistant", content: resposta }
      ]
    });
  } catch (error) {
    handleError(res, error);
  }
}
async function handleAnalyzePhoto(req, res) {
  try {
    const input = analyzePhotoInputSchema.parse(req.body);
    const data = await invokeStructuredJson(
      [
        { role: "system", content: buildCoreSystemPrompt() },
        {
          role: "user",
          content: [
            { type: "text", text: buildPhotoPrompt(input.usuario) },
            { type: "image_url", image_url: { url: input.imageDataUrl, detail: "high" } }
          ]
        }
      ],
      photoAnalysisSchema
    );
    jsonResponse(res, 200, data);
  } catch (error) {
    handleError(res, error);
  }
}
async function handleEvaluateProgress(req, res) {
  try {
    const input = progressInputSchema.parse(req.body);
    const data = await invokeStructuredJson(
      [
        { role: "system", content: buildCoreSystemPrompt() },
        { role: "user", content: buildProgressPrompt(input) }
      ],
      progressEvaluationSchema
    );
    jsonResponse(res, 200, data);
  } catch (error) {
    handleError(res, error);
  }
}
function handleError(res, error) {
  console.error("[Personal API]", error);
  if (error instanceof z2.ZodError) {
    return jsonResponse(res, 400, {
      error: "Dados inv\xE1lidos",
      details: error.flatten()
    });
  }
  if (error instanceof SyntaxError) {
    return jsonResponse(res, 502, {
      error: "A IA retornou um JSON inv\xE1lido. Tente novamente."
    });
  }
  return jsonResponse(res, 500, {
    error: error instanceof Error ? error.message : "Falha interna ao processar a solicita\xE7\xE3o."
  });
}
function registerPersonalRoutes(app) {
  const routes = [
    ["/api/gerar-plano", handleGeneratePlan],
    ["/api/ajustar-plano", handleAdjustPlan],
    ["/api/chat-personal", handleChatPersonal],
    ["/api/analisar-foto", handleAnalyzePhoto],
    ["/api/avaliar-progresso", handleEvaluateProgress],
    ["/gerar-plano", handleGeneratePlan],
    ["/ajustar-plano", handleAdjustPlan],
    ["/chat-personal", handleChatPersonal],
    ["/analisar-foto", handleAnalyzePhoto],
    ["/avaliar-progresso", handleEvaluateProgress]
  ];
  routes.forEach(([path3, handler]) => {
    app.post(path3, (req, res) => {
      void handler(req, res);
    });
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  registerPersonalRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
