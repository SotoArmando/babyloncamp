import { createServer } from "node:http";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = join(dirname(fileURLToPath(import.meta.url)), "data");
mkdirSync(join(root, "uploads"), { recursive: true });
const db = new DatabaseSync(join(root, "account.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    pass TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orgs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS members (
    org_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    PRIMARY KEY (org_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    org_id TEXT NOT NULL,
    hash TEXT NOT NULL,
    label TEXT NOT NULL,
    admin INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS profiles (
    gallery_id TEXT PRIMARY KEY,
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS settings (
    scope TEXT NOT NULL,
    scope_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY (scope, scope_id, key)
  );
  CREATE TABLE IF NOT EXISTS drops (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT '',
    org_id TEXT NOT NULL DEFAULT '',
    gallery_id TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    pass TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    gallery_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    actor TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

const port = Number(process.env.ACCOUNT_PORT) || 8780;
const id = () => randomBytes(12).toString("base64url");

function hashPass(password, salt = randomBytes(16).toString("hex")) {
  const key = scryptSync(String(password), salt, 32).toString("hex");
  return `${salt}:${key}`;
}

function checkPass(password, stored) {
  const [salt, key] = String(stored || "").split(":");
  if (!salt || !key) return false;
  const next = scryptSync(String(password), salt, 32);
  const prev = Buffer.from(key, "hex");
  return prev.length === next.length && timingSafeEqual(prev, next);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
      if (chunks.reduce((n, c) => n + c.length, 0) > 8_000_000) reject(new Error("grande"));
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function cookie(req) {
  const raw = req.headers.cookie || "";
  const out = {};
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

function userById(userId) {
  return db.prepare("SELECT id, email, name, avatar FROM users WHERE id = ?").get(userId) || null;
}

function auth(req) {
  const header = String(req.headers.authorization || "");
  if (header.startsWith("Bearer ")) {
    const token = header.slice(7).trim();
    const row = db.prepare("SELECT * FROM tokens").all().find((item) => checkPass(token, item.hash));
    if (!row) return null;
    return { user: userById(row.user_id), orgId: row.org_id, admin: Boolean(row.admin), token: true };
  }
  const sid = cookie(req).sid;
  if (!sid) return null;
  const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sid);
  if (!session || session.expires < Date.now()) return null;
  const member = db.prepare("SELECT org_id, role FROM members WHERE user_id = ? ORDER BY role = 'owner' DESC").get(session.user_id);
  return { user: userById(session.user_id), orgId: member?.org_id || "", admin: true, token: false };
}

function publicUser(user, orgId) {
  if (!user) return null;
  const orgs = db.prepare(`
    SELECT orgs.id, orgs.name, members.role
    FROM members JOIN orgs ON orgs.id = members.org_id
    WHERE members.user_id = ?
  `).all(user.id);
  return { ...user, orgId, orgs };
}

function resolvedSettings(actor) {
  const rows = db.prepare("SELECT scope, scope_id, key, value FROM settings").all();
  const pick = {};
  const rank = { global: 1, org: 2, user: 3 };
  for (const row of rows) {
    const ok = row.scope === "global"
      || (row.scope === "org" && actor?.orgId && row.scope_id === actor.orgId)
      || (row.scope === "user" && actor?.user && row.scope_id === actor.user.id);
    if (!ok) continue;
    const prev = pick[row.key];
    if (!prev || rank[row.scope] >= rank[prev.scope]) pick[row.key] = row;
  }
  const out = {};
  for (const [key, row] of Object.entries(pick)) out[key] = row.value;
  return out;
}

function send(res, status, data, extra = {}) {
  const origin = extra.origin || "*";
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    Vary: "Origin",
  });
  res.end(JSON.stringify(data));
}

function allowOrigin(req) {
  const origin = String(req.headers.origin || "");
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  return "http://127.0.0.1:8765";
}

const server = createServer(async (req, res) => {
  const origin = allowOrigin(req);
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    });
    res.end();
    return;
  }
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  const path = url.pathname;
  try {
    const actor = auth(req);
    const json = async () => JSON.parse((await readBody(req)).toString("utf8") || "{}");

    if (req.method === "POST" && path === "/api/register") {
      const body = await json();
      const email = String(body.email || "").trim().toLowerCase();
      const name = String(body.name || "").trim();
      const password = String(body.password || "");
      if (!email || !name || password.length < 4) return send(res, 400, { error: "Nombre, correo y una contraseña de 4 caracteres." }, { origin });
      if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) return send(res, 409, { error: "Ese correo ya tiene cuenta." }, { origin });
      const userId = id();
      const orgId = id();
      db.prepare("INSERT INTO users (id, email, name, pass, avatar, created_at) VALUES (?, ?, ?, ?, '', ?)").run(userId, email, name, hashPass(password), Date.now());
      db.prepare("INSERT INTO orgs (id, name, created_at) VALUES (?, ?, ?)").run(orgId, `Espacio de ${name}`, Date.now());
      db.prepare("INSERT INTO members (org_id, user_id, role) VALUES (?, ?, 'owner')").run(orgId, userId);
      const sid = id();
      db.prepare("INSERT INTO sessions (id, user_id, expires) VALUES (?, ?, ?)").run(sid, userId, Date.now() + 14 * 864e5);
      res.setHeader("Set-Cookie", `sid=${sid}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${14 * 86400}`);
      return send(res, 201, { user: publicUser(userById(userId), orgId) }, { origin });
    }

    if (req.method === "POST" && path === "/api/login") {
      const body = await json();
      const email = String(body.email || "").trim().toLowerCase();
      const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!row || !checkPass(body.password, row.pass)) return send(res, 401, { error: "Correo o contraseña incorrectos." }, { origin });
      const sid = id();
      db.prepare("INSERT INTO sessions (id, user_id, expires) VALUES (?, ?, ?)").run(sid, row.id, Date.now() + 14 * 864e5);
      const member = db.prepare("SELECT org_id FROM members WHERE user_id = ?").get(row.id);
      res.setHeader("Set-Cookie", `sid=${sid}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${14 * 86400}`);
      return send(res, 200, { user: publicUser(userById(row.id), member?.org_id || "") }, { origin });
    }

    if (req.method === "POST" && path === "/api/logout") {
      const sid = cookie(req).sid;
      if (sid) db.prepare("DELETE FROM sessions WHERE id = ?").run(sid);
      res.setHeader("Set-Cookie", "sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
      return send(res, 200, { ok: true }, { origin });
    }

    if (req.method === "GET" && path === "/api/me") {
      return send(res, 200, { user: actor?.user ? publicUser(actor.user, actor.orgId) : null, settings: resolvedSettings(actor) }, { origin });
    }

    if (req.method === "GET" && path === "/api/home") {
      if (!actor?.user) return send(res, 401, { error: "Entra para ver tu inicio." }, { origin });
      const profiles = db.prepare("SELECT * FROM profiles WHERE owner_id = ? OR owner_id IN (SELECT org_id FROM members WHERE user_id = ?)").all(actor.user.id, actor.user.id);
      const members = actor.orgId
        ? db.prepare("SELECT users.id, users.name, users.email, members.role FROM members JOIN users ON users.id = members.user_id WHERE members.org_id = ?").all(actor.orgId)
        : [];
      return send(res, 200, { user: publicUser(actor.user, actor.orgId), profiles, members, settings: resolvedSettings(actor) }, { origin });
    }

    if (req.method === "POST" && path === "/api/invite") {
      if (!actor?.admin || !actor.user) return send(res, 403, { error: "Hace falta una sesión para invitar." }, { origin });
      const body = await json();
      const email = String(body.email || "").trim().toLowerCase();
      const name = String(body.name || "").trim() || email;
      const password = String(body.password || "");
      if (!email || password.length < 4) return send(res, 400, { error: "Correo y contraseña del invitado." }, { origin });
      let person = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!person) {
        const userId = id();
        db.prepare("INSERT INTO users (id, email, name, pass, avatar, created_at) VALUES (?, ?, ?, ?, '', ?)").run(userId, email, name, hashPass(password), Date.now());
        person = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      }
      db.prepare("INSERT OR IGNORE INTO members (org_id, user_id, role) VALUES (?, ?, 'member')").run(actor.orgId, person.id);
      return send(res, 201, { ok: true }, { origin });
    }

    if (req.method === "DELETE" && path.startsWith("/api/members/")) {
      if (!actor?.admin) return send(res, 403, { error: "Sin permiso." }, { origin });
      const userId = path.split("/").pop();
      if (userId === actor.user.id) return send(res, 400, { error: "No puedes quitarte a ti." }, { origin });
      db.prepare("DELETE FROM members WHERE org_id = ? AND user_id = ? AND role != 'owner'").run(actor.orgId, userId);
      return send(res, 200, { ok: true }, { origin });
    }

    if (req.method === "POST" && path === "/api/tokens") {
      if (!actor?.admin || !actor.user) return send(res, 403, { error: "Entra para crear un token." }, { origin });
      const body = await json();
      const token = `clx_${randomBytes(18).toString("base64url")}`;
      db.prepare("INSERT INTO tokens (id, user_id, org_id, hash, label, admin, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)").run(id(), actor.user.id, actor.orgId, hashPass(token), String(body.label || "Externo"), Date.now());
      return send(res, 201, { token }, { origin });
    }

    if (req.method === "PUT" && path === "/api/settings") {
      if (!actor?.user) return send(res, 401, { error: "Entra para guardar." }, { origin });
      const body = await json();
      const scope = ["global", "org", "user"].includes(body.scope) ? body.scope : "user";
      if (scope === "global" && !actor.admin) return send(res, 403, { error: "El nivel global pide sesión de cuenta." }, { origin });
      if (actor.token && scope !== "user") return send(res, 403, { error: "Este token no administra niveles." }, { origin });
      const scopeId = scope === "global" ? "*" : scope === "org" ? actor.orgId : actor.user.id;
      const key = String(body.key || "").slice(0, 40);
      if (!key) return send(res, 400, { error: "Falta la clave." }, { origin });
      db.prepare("INSERT INTO settings (scope, scope_id, key, value) VALUES (?, ?, ?, ?) ON CONFLICT(scope, scope_id, key) DO UPDATE SET value = excluded.value").run(scope, scopeId, key, String(body.value ?? ""));
      return send(res, 200, { settings: resolvedSettings(actor) }, { origin });
    }

    if (req.method === "POST" && path === "/api/profiles") {
      if (!actor?.user) return send(res, 401, { error: "Entra para vincular." }, { origin });
      const body = await json();
      const galleryId = String(body.galleryId || "");
      if (!galleryId) return send(res, 400, { error: "Falta el perfil." }, { origin });
      const ownerType = body.scope === "org" ? "org" : "user";
      const ownerId = ownerType === "org" ? actor.orgId : actor.user.id;
      db.prepare("INSERT INTO profiles (gallery_id, owner_type, owner_id, title) VALUES (?, ?, ?, ?) ON CONFLICT(gallery_id) DO UPDATE SET owner_type = excluded.owner_type, owner_id = excluded.owner_id").run(galleryId, ownerType, ownerId, String(body.title || ""));
      return send(res, 200, { ok: true }, { origin });
    }

    if (req.method === "GET" && path === "/api/profiles") {
      if (!actor?.user) return send(res, 401, { error: "Entra para ver perfiles." }, { origin });
      const rows = db.prepare("SELECT * FROM profiles WHERE owner_id = ? OR owner_id = ?").all(actor.user.id, actor.orgId);
      return send(res, 200, { profiles: rows }, { origin });
    }

    if (req.method === "POST" && path === "/api/drops") {
      const body = await json();
      const dropId = id();
      const pass = String(body.password || "");
      db.prepare("INSERT INTO drops (id, user_id, org_id, gallery_id, note, pass, image, created_at) VALUES (?, ?, ?, ?, ?, ?, '', ?)").run(
        dropId,
        actor?.user?.id || "",
        actor?.orgId || "",
        String(body.galleryId || ""),
        String(body.note || ""),
        pass ? hashPass(pass) : "",
        Date.now(),
      );
      const page = `${origin}/drop.html?id=${dropId}`;
      return send(res, 201, { id: dropId, url: page }, { origin });
    }

    const dropMatch = path.match(/^\/api\/drops\/([^/]+)(\/image|\/file)?$/);
    if (dropMatch && req.method === "GET" && !dropMatch[2]) {
      const drop = db.prepare("SELECT id, note, gallery_id, image, pass FROM drops WHERE id = ?").get(dropMatch[1]);
      if (!drop) return send(res, 404, { error: "Ese enlace no existe." }, { origin });
      const open = !drop.pass || cookie(req)[`drop_${drop.id}`] === "ok";
      return send(res, 200, { id: drop.id, note: open ? drop.note : "", locked: !open, image: open ? drop.image : "", galleryId: drop.gallery_id }, { origin });
    }

    if (dropMatch && req.method === "POST" && !dropMatch[2]) {
      const drop = db.prepare("SELECT * FROM drops WHERE id = ?").get(dropMatch[1]);
      if (!drop) return send(res, 404, { error: "Ese enlace no existe." }, { origin });
      const body = await json();
      if (drop.pass && !checkPass(body.password, drop.pass)) return send(res, 401, { error: "Contraseña incorrecta." }, { origin });
      res.setHeader("Set-Cookie", `drop_${drop.id}=ok; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`);
      return send(res, 200, { ok: true, note: drop.note }, { origin });
    }

    if (dropMatch && dropMatch[2] === "/image" && req.method === "POST") {
      const drop = db.prepare("SELECT * FROM drops WHERE id = ?").get(dropMatch[1]);
      if (!drop) return send(res, 404, { error: "Ese enlace no existe." }, { origin });
      if (drop.pass && cookie(req)[`drop_${drop.id}`] !== "ok") return send(res, 401, { error: "Primero la contraseña." }, { origin });
      const buf = await readBody(req);
      const file = `${drop.id}.bin`;
      writeFileSync(join(root, "uploads", file), buf);
      db.prepare("UPDATE drops SET image = ? WHERE id = ?").run(`/api/drops/${drop.id}/file`, drop.id);
      const galleryId = drop.gallery_id || drop.id;
      db.prepare("INSERT INTO events (id, gallery_id, kind, body, actor, level, created_at) VALUES (?, ?, 'image', ?, ?, 'global', ?)").run(id(), galleryId, `/api/drops/${drop.id}/file`, "Enlace", Date.now());
      return send(res, 200, { galleryId, review: `/review.html?id=${encodeURIComponent(galleryId)}` }, { origin });
    }

    if (dropMatch && dropMatch[2] === "/file" && req.method === "GET") {
      const file = join(root, "uploads", `${dropMatch[1]}.bin`);
      if (!existsSync(file)) return send(res, 404, { error: "Sin imagen." }, { origin });
      res.writeHead(200, { "Content-Type": "image/jpeg", "Access-Control-Allow-Origin": origin, "Cache-Control": "no-store" });
      res.end(readFileSync(file));
      return;
    }

    const ficha = path.match(/^\/api\/ficha\/([^/]+)$/);
    if (ficha && req.method === "GET") {
      const galleryId = decodeURIComponent(ficha[1]);
      const events = db.prepare("SELECT kind, body, actor, level, created_at FROM events WHERE gallery_id = ? ORDER BY created_at").all(galleryId);
      const likes = events.filter((row) => row.kind === "like").length;
      return send(res, 200, { events, likes }, { origin });
    }

    if (ficha && req.method === "POST") {
      const galleryId = decodeURIComponent(ficha[1]);
      const body = await json();
      const kind = ["like", "comment", "image"].includes(body.kind) ? body.kind : "";
      if (!kind) return send(res, 400, { error: "La acción es like, imagen o comentario." }, { origin });
      if (kind === "comment" && !String(body.body || "").trim()) return send(res, 400, { error: "Escribe el comentario." }, { origin });
      const level = ["global", "org", "user"].includes(body.level) ? body.level : (actor?.user ? "user" : "global");
      const actorName = actor?.user?.name || "Enlace";
      db.prepare("INSERT INTO events (id, gallery_id, kind, body, actor, level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id(), galleryId, kind, String(body.body || "").slice(0, 2000), actorName, level, Date.now());
      return send(res, 201, { ok: true }, { origin });
    }

    send(res, 404, { error: "No está." }, { origin });
  } catch (err) {
    send(res, 500, { error: err.message || "Error" }, { origin });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`cuentas en http://127.0.0.1:${port}`);
});
