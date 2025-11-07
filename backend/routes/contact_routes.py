from flask import Blueprint, request, jsonify
from datetime import datetime
import models

contact_bp = Blueprint('contact', __name__)


@contact_bp.route('/contact', methods=['POST'])
def contact_submit():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    name = data.get('name', 'there')
    email = data.get('email', '')
    message = data.get('message', '')

    # Store in DB
    conn = models.connect(); cur = conn.cursor()
    cur.execute('INSERT INTO contacts (name,email,message,created_at) VALUES (?,?,?,?)',
                (name, email, message, datetime.utcnow().isoformat()))
    conn.commit(); conn.close()

    # Simulated AI reply
    reply = (
        f"Hi {name}, thanks for reaching out! We reviewed your message and will respond within one business day. "
        f"Summary: {message[:120]}..."
    )
    return jsonify(ok=True, ai_reply=reply)
