import os, uuid, sqlite3, json, math
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, "scan_to_print.db")
UPLOAD_DIR = os.path.join(BASE, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024

ALLOWED = {".pdf",".png",".jpg",".jpeg",".webp"}
PRICE_BW = float(os.getenv("PRICE_BW", "2"))
PRICE_COLOR = float(os.getenv("PRICE_COLOR", "5"))

def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    con = db()
    con.executescript("""
    CREATE TABLE IF NOT EXISTS orders(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      pages INTEGER NOT NULL DEFAULT 1,
      copies INTEGER NOT NULL DEFAULT 1,
      mode TEXT NOT NULL DEFAULT 'bw',
      duplex INTEGER NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      status TEXT NOT NULL DEFAULT 'queued',
      created_at TEXT NOT NULL
    );
    """)
    con.commit(); con.close()

def price(pages, copies, mode, duplex):
    base = PRICE_COLOR if mode == "color" else PRICE_BW
    # Duplex uses one sheet for two printed sides; charge per printed side.
    return round(max(1, pages) * max(1, copies) * base, 2)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/admin")
def admin():
    return render_template("admin.html")

@app.route("/api/health")
def health():
    return jsonify(ok=True, service="scan-to-print")

@app.route("/api/calculate", methods=["POST"])
def calculate():
    d = request.get_json(silent=True) or {}
    pages = max(1, int(d.get("pages", 1)))
    copies = max(1, int(d.get("copies", 1)))
    mode = "color" if d.get("mode") == "color" else "bw"
    duplex = bool(d.get("duplex", False))
    return jsonify(pages=pages, copies=copies, mode=mode, duplex=duplex,
                   price=price(pages,copies,mode,duplex), currency="INR")

@app.route("/api/upload", methods=["POST"])
def upload():
    f = request.files.get("file")
    if not f or not f.filename:
        return jsonify(error="File missing"), 400
    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in ALLOWED:
        return jsonify(error="Unsupported file type"), 400

    token = uuid.uuid4().hex[:8].upper()
    stored = token + ext
    f.save(os.path.join(UPLOAD_DIR, stored))

    # PDF page count if pypdf is installed; otherwise safe fallback to 1.
    pages = 1
    if ext == ".pdf":
        try:
            from pypdf import PdfReader
            pages = max(1, len(PdfReader(os.path.join(UPLOAD_DIR, stored)).pages))
        except Exception:
            pages = 1

    con = db()
    con.execute("""INSERT INTO orders
      (token,original_name,stored_name,pages,copies,mode,duplex,total,created_at)
      VALUES (?,?,?,?,?,?,?,?,?)""",
      (token,f.filename,stored,pages,1,"bw",0,price(pages,1,"bw",False),
       datetime.now().isoformat(timespec="seconds")))
    con.commit(); con.close()
    return jsonify(token=token, filename=f.filename, pages=pages)

@app.route("/api/order/<token>", methods=["GET"])
def get_order(token):
    con=db(); row=con.execute("SELECT * FROM orders WHERE token=?", (token,)).fetchone(); con.close()
    if not row: return jsonify(error="Order not found"),404
    return jsonify(dict(row))

@app.route("/api/order/<token>", methods=["POST"])
def update_order(token):
    d=request.get_json(silent=True) or {}
    pages=max(1,int(d.get("pages",1)))
    copies=max(1,int(d.get("copies",1)))
    mode="color" if d.get("mode")=="color" else "bw"
    duplex=1 if d.get("duplex") else 0
    total=price(pages,copies,mode,duplex)
    con=db()
    cur=con.execute("""UPDATE orders SET pages=?,copies=?,mode=?,duplex=?,total=?
                       WHERE token=?""",(pages,copies,mode,duplex,total,token))
    con.commit(); con.close()
    if cur.rowcount == 0: return jsonify(error="Order not found"),404
    return jsonify(ok=True,total=total)

@app.route("/api/order/<token>/pay", methods=["POST"])
def pay(token):
    # Demo payment endpoint. Replace this with Razorpay server-side verification
    # before taking real payments.
    con=db()
    cur=con.execute("UPDATE orders SET payment_status='paid', status='printing' WHERE token=?",(token,))
    con.commit(); con.close()
    if cur.rowcount == 0: return jsonify(error="Order not found"),404
    return jsonify(ok=True, payment_status="paid", status="printing")

@app.route("/api/orders")
def orders():
    con=db()
    rows=con.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 200").fetchall()
    con.close()
    return jsonify(orders=[dict(r) for r in rows])

@app.route("/api/order/<token>/status", methods=["POST"])
def status(token):
    d=request.get_json(silent=True) or {}
    allowed={"queued","printing","completed","failed","cancelled"}
    s=d.get("status")
    if s not in allowed: return jsonify(error="Invalid status"),400
    con=db(); cur=con.execute("UPDATE orders SET status=? WHERE token=?",(s,token))
    con.commit(); con.close()
    if cur.rowcount==0:return jsonify(error="Order not found"),404
    return jsonify(ok=True,status=s)

@app.route("/uploads/<name>")
def upload_file(name):
    return send_from_directory(UPLOAD_DIR, name, as_attachment=False)

@app.errorhandler(413)
def too_large(_):
    return jsonify(error="File too large. Maximum 25 MB."),413

@app.errorhandler(404)
def not_found(_):
    if request.path.startswith("/api/"):
        return jsonify(error="Not found"),404
    return "Not found",404

init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT","5000")))
