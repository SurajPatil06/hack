from flask import Flask, jsonify
try:
    from flask_cors import CORS
except Exception:  # minimal fallback if flask-cors not installed
    CORS = None

from routes.ai_routes import ai_bp
from routes.contact_routes import contact_bp
from routes.job_routes import job_bp
from routes.admin_routes import admin_bp
from models import init_db, seed_jobs_if_empty, DB_PATH as _DB_PATH
import os


def create_app():
    app = Flask(__name__)

    # Configure DB path
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'database', 'mastersolis.db'))
    import models as _models
    _models.DB_PATH = db_path
    init_db()
    seed_jobs_if_empty()

    if CORS:
        CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Blueprints
    app.register_blueprint(ai_bp, url_prefix="/api/ai")
    app.register_blueprint(contact_bp, url_prefix="/api")
    app.register_blueprint(job_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.after_request
    def add_cors_headers(resp):
        # Safe defaults if flask-cors is missing or misconfigured
        resp.headers.setdefault("Access-Control-Allow-Origin", "*")
        resp.headers.setdefault("Access-Control-Allow-Headers", "Content-Type, Authorization")
        resp.headers.setdefault("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        return resp

    @app.route('/api/health')
    def health():
        return jsonify(status='ok')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=True)
