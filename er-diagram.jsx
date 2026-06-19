import { useState } from "react";

const C = {
  bg: "#0f1117", surface: "#1a1d27", card: "#1e2235", border: "#2a2f45",
  accent: "#6366f1", accentLight: "#818cf8",
  pk: "#f59e0b", fk: "#34d399", field: "#94a3b8", label: "#cbd5e1", white: "#f1f5f9",
  userColor: "#6366f1", productColor: "#ec4899",
  orderColor: "#f59e0b", cartColor: "#34d399",
};

const tables = [
  {
    id: "users", name: "users", color: C.userColor, x: 50, y: 60, width: 252,
    fields: [
      { name: "id",            type: "UUID",         pk: true },
      { name: "email",         type: "VARCHAR(255)", unique: true },
      { name: "password_hash", type: "VARCHAR(255)" },
      { name: "username",      type: "VARCHAR(100)", unique: true },
      { name: "role",          type: "ENUM(seller,buyer)" },
      { name: "full_name",     type: "VARCHAR(200)" },
      { name: "phone",         type: "VARCHAR(20)",  nullable: true },
      { name: "avatar_url",    type: "TEXT",         nullable: true },
      { name: "is_active",     type: "BOOLEAN" },
      { name: "created_at",    type: "TIMESTAMP" },
      { name: "updated_at",    type: "TIMESTAMP" },
    ],
  },
  {
    id: "seller_profiles", name: "seller_profiles", color: C.userColor, x: 356, y: 60, width: 252,
    fields: [
      { name: "id",                type: "UUID",         pk: true },
      { name: "user_id",           type: "UUID",         fk: true, unique: true },
      { name: "store_name",        type: "VARCHAR(200)" },
      { name: "store_description", type: "TEXT",         nullable: true },
      { name: "store_logo_url",    type: "TEXT",         nullable: true },
      { name: "created_at",        type: "TIMESTAMP" },
    ],
  },
  {
    id: "products", name: "products", color: C.productColor, x: 50, y: 420, width: 262,
    fields: [
      { name: "id",            type: "UUID",          pk: true },
      { name: "seller_id",     type: "UUID",          fk: true },
      { name: "title",         type: "VARCHAR(300)" },
      { name: "description",   type: "TEXT" },
      { name: "unit_price",    type: "DECIMAL(12,2)" },
      { name: "quantity",      type: "INTEGER" },
      { name: "sku",           type: "VARCHAR(100)",  nullable: true, unique: true },
      { name: "status",        type: "ENUM(active,inactive,draft)" },
      { name: "thumbnail_url", type: "TEXT" },
      { name: "created_at",    type: "TIMESTAMP" },
      { name: "updated_at",    type: "TIMESTAMP" },
    ],
  },
  {
    id: "product_images", name: "product_images", color: C.productColor, x: 370, y: 420, width: 248,
    fields: [
      { name: "id",         type: "UUID",         pk: true },
      { name: "product_id", type: "UUID",         fk: true },
      { name: "image_url",  type: "TEXT" },
      { name: "alt_text",   type: "VARCHAR(200)", nullable: true },
      { name: "sort_order", type: "INTEGER" },
      { name: "is_primary", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "carts", name: "carts", color: C.cartColor, x: 668, y: 60, width: 242,
    fields: [
      { name: "id",         type: "UUID",      pk: true },
      { name: "buyer_id",   type: "UUID",      fk: true, unique: true },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "cart_items", name: "cart_items", color: C.cartColor, x: 668, y: 280, width: 242,
    fields: [
      { name: "id",         type: "UUID",      pk: true },
      { name: "cart_id",    type: "UUID",      fk: true },
      { name: "product_id", type: "UUID",      fk: true },
      { name: "quantity",   type: "INTEGER" },
      { name: "added_at",   type: "TIMESTAMP" },
    ],
  },
  {
    id: "orders", name: "orders", color: C.orderColor, x: 50, y: 760, width: 262,
    fields: [
      { name: "id",               type: "UUID",          pk: true },
      { name: "buyer_id",         type: "UUID",          fk: true },
      { name: "status",           type: "ENUM(pending,confirmed,cancelled)" },
      { name: "total_amount",     type: "DECIMAL(14,2)" },
      { name: "shipping_address", type: "TEXT" },
      { name: "payment_method",   type: "VARCHAR(50)",   nullable: true },
      { name: "note",             type: "TEXT",          nullable: true },
      { name: "ordered_at",       type: "TIMESTAMP" },
      { name: "updated_at",       type: "TIMESTAMP" },
    ],
  },
  {
    id: "order_items", name: "order_items", color: C.orderColor, x: 370, y: 760, width: 258,
    fields: [
      { name: "id",         type: "UUID",          pk: true },
      { name: "order_id",   type: "UUID",          fk: true },
      { name: "product_id", type: "UUID",          fk: true },
      { name: "quantity",   type: "INTEGER" },
      { name: "unit_price", type: "DECIMAL(12,2)" },
      { name: "subtotal",   type: "DECIMAL(14,2)" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
];

const ROW_H = 27, HDR_H = 36;
const getH = t => HDR_H + t.fields.length * ROW_H + 8;
const getFieldY = (t, fname) => {
  const i = t.fields.findIndex(f => f.name === fname);
  return t.y + HDR_H + i * ROW_H + ROW_H / 2 + 4;
};

// [fromId, fromField, toId, toField, label]
const relations = [
  ["seller_profiles", "user_id",    "users",           "id",         "1:1"],
  ["products",        "seller_id",  "seller_profiles", "id",         "M:1"],
  ["product_images",  "product_id", "products",        "id",         "M:1"],
  ["carts",           "buyer_id",   "users",           "id",         "1:1"],
  ["cart_items",      "cart_id",    "carts",           "id",         "M:1"],
  ["cart_items",      "product_id", "products",        "id",         "M:1"],
  ["orders",          "buyer_id",   "users",           "id",         "M:1"],
  ["order_items",     "order_id",   "orders",          "id",         "M:1"],
  ["order_items",     "product_id", "products",        "id",         "M:1"],
];

const GROUPS = [
  { label: "Auth / User",   color: C.userColor,    ids: ["users","seller_profiles"] },
  { label: "Product",       color: C.productColor, ids: ["products","product_images"] },
  { label: "Cart",          color: C.cartColor,    ids: ["carts","cart_items"] },
  { label: "Order",         color: C.orderColor,   ids: ["orders","order_items"] },
];

function RelLine({ rel, tbls }) {
  const fT = tbls.find(t => t.id === rel[0]);
  const tT = tbls.find(t => t.id === rel[2]);
  if (!fT || !tT) return null;

  const fy = getFieldY(fT, rel[1]);
  const ty = getFieldY(tT, rel[3]);
  let x1, y1, x2, y2;
  if (fT.x + fT.width + 10 <= tT.x) {
    x1 = fT.x + fT.width; y1 = fy; x2 = tT.x; y2 = ty;
  } else if (tT.x + tT.width + 10 <= fT.x) {
    x1 = fT.x; y1 = fy; x2 = tT.x + tT.width; y2 = ty;
  } else if (fT.y + getH(fT) < tT.y) {
    x1 = fT.x + fT.width / 2; y1 = fT.y + getH(fT);
    x2 = tT.x + tT.width / 2; y2 = tT.y;
  } else {
    x1 = fT.x + fT.width / 2; y1 = fT.y;
    x2 = tT.x + tT.width / 2; y2 = tT.y + getH(tT);
  }
  const mx = (x1 + x2) / 2;
  const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;

  return (
    <g>
      <path d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
        fill="none" stroke={C.fk} strokeWidth="1.5" strokeDasharray="5,3"
        opacity="0.65" markerEnd="url(#arr)" />
      <text x={midX} y={midY - 4} textAnchor="middle"
        fill={C.fk} fontSize="9" fontFamily="monospace" fontWeight="700" opacity="0.9"
        style={{ pointerEvents: "none" }}>
        {rel[4]}
      </text>
    </g>
  );
}

function TableCard({ table, highlighted, onClick }) {
  const h = getH(table);
  const dim = highlighted !== null && highlighted !== table.id;
  return (
    <g onClick={() => onClick(table.id)} style={{ cursor: "pointer" }} opacity={dim ? 0.2 : 1}>
      <rect x={table.x + 4} y={table.y + 4} width={table.width} height={h} rx={8} fill="rgba(0,0,0,0.4)" />
      <rect x={table.x} y={table.y} width={table.width} height={h} rx={8}
        fill={C.card}
        stroke={highlighted === table.id ? table.color : C.border}
        strokeWidth={highlighted === table.id ? 2.5 : 1} />
      <rect x={table.x} y={table.y} width={table.width} height={HDR_H} rx={8} fill={table.color} opacity="0.92" />
      <rect x={table.x} y={table.y + HDR_H - 6} width={table.width} height={8} fill={table.color} opacity="0.92" />
      <text x={table.x + table.width / 2} y={table.y + HDR_H / 2 + 5}
        textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="monospace">
        {table.name}
      </text>
      {table.fields.map((f, i) => {
        const fy = table.y + HDR_H + i * ROW_H + 5;
        return (
          <g key={f.name}>
            {i % 2 === 0 && <rect x={table.x + 1} y={fy} width={table.width - 2} height={ROW_H} fill="rgba(255,255,255,0.025)" />}
            {f.pk && <text x={table.x + 9} y={fy + ROW_H / 2 + 4} fill={C.pk} fontSize="8.5" fontWeight="800" fontFamily="monospace">PK</text>}
            {f.fk && !f.pk && <text x={table.x + 9} y={fy + ROW_H / 2 + 4} fill={C.fk} fontSize="8.5" fontWeight="800" fontFamily="monospace">FK</text>}
            <text x={table.x + 30} y={fy + ROW_H / 2 + 4}
              fill={f.pk ? C.pk : f.fk ? C.fk : C.label}
              fontSize="10.5" fontFamily="monospace" fontWeight={f.pk ? "700" : "400"}>
              {f.name}{f.nullable ? " ?" : ""}{f.unique && !f.pk ? " *" : ""}
            </text>
            <text x={table.x + table.width - 7} y={fy + ROW_H / 2 + 4}
              textAnchor="end" fill={C.field} fontSize="9" fontFamily="monospace" opacity="0.75">
              {f.type}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function ERDiagram() {
  const [highlighted, setHighlighted] = useState(null);
  const [filterGroup, setFilterGroup] = useState(null);

  const visibleIds = filterGroup ? GROUPS.find(g => g.label === filterGroup)?.ids : null;
  const filteredTables = visibleIds ? tables.filter(t => visibleIds.includes(t.id)) : tables;
  const filteredRels = visibleIds
    ? relations.filter(r => visibleIds.includes(r[0]) && visibleIds.includes(r[2]))
    : relations;

  const handleClick = id => { setHighlighted(p => p === id ? null : id); setFilterGroup(null); };
  const handleGroup = label => { setFilterGroup(p => p === label ? null : label); setHighlighted(null); };

  const SVG_W = 960, SVG_H = 1060;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: C.accentLight, fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 3 }}>
            StoreFront Management System
          </div>
          <div style={{ color: C.white, fontSize: "18px", fontWeight: 800 }}>
            Entity-Relationship Diagram
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: "11px", fontFamily: "monospace", alignItems: "center" }}>
          <span style={{ color: C.pk }}>■ PK — Primary Key</span>
          <span style={{ color: C.fk }}>■ FK — Foreign Key</span>
          <span style={{ color: "#64748b" }}>? nullable　* unique</span>
        </div>
      </div>

      {/* Group Filter */}
      <div style={{ display: "flex", gap: 8, padding: "10px 24px", background: C.surface, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: C.field, fontSize: "12px" }}>Filter:</span>
        <button onClick={() => { setFilterGroup(null); setHighlighted(null); }}
          style={{ background: !filterGroup ? C.accent : "transparent", color: !filterGroup ? "white" : C.field, border: `1px solid ${!filterGroup ? C.accent : C.border}`, borderRadius: 20, padding: "4px 14px", fontSize: "12px", cursor: "pointer" }}>
          All Tables ({tables.length})
        </button>
        {GROUPS.map(g => (
          <button key={g.label} onClick={() => handleGroup(g.label)}
            style={{ background: filterGroup === g.label ? g.color : "transparent", color: filterGroup === g.label ? "white" : C.field, border: `1px solid ${filterGroup === g.label ? g.color : C.border}`, borderRadius: 20, padding: "4px 14px", fontSize: "12px", cursor: "pointer" }}>
            {g.label}
          </button>
        ))}
        <span style={{ color: "#475569", fontSize: "11px", marginLeft: 8 }}>คลิกที่ตารางเพื่อ highlight</span>
      </div>

      {/* SVG */}
      <div style={{ overflow: "auto" }}>
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: "block", minWidth: SVG_W }}>
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke={C.border} strokeWidth="0.3" opacity="0.4" />
            </pattern>
            <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={C.fk} opacity="0.85" />
            </marker>
          </defs>
          <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />
          {filteredRels.map((r, i) => <RelLine key={i} rel={r} tbls={filteredTables} />)}
          {filteredTables.map(t => <TableCard key={t.id} table={t} highlighted={highlighted} onClick={handleClick} />)}
        </svg>
      </div>

      {/* Footer */}
      <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "10px 24px", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        {GROUPS.map(g => (
          <span key={g.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: g.color, display: "inline-block" }} />
            <span style={{ color: C.label, fontSize: "11px" }}>{g.label}</span>
          </span>
        ))}
        <span style={{ color: C.field, fontSize: "11px", marginLeft: "auto" }}>
          {tables.length} tables · {relations.length} relations
        </span>
      </div>
    </div>
  );
}
