from flask import Blueprint, request, jsonify

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/tagline', methods=['POST'])
def generate_tagline():
    data = request.get_json(silent=True) or {}
    company = data.get('company', 'Mastersolis Infotech')
    tone = data.get('tone', 'innovative')
    tagline = f"{company}: {tone.title()} AI solutions that ship value fast."
    return jsonify(tagline=tagline)


@ai_bp.route('/generate', methods=['POST'])
def generate_text():
    data = request.get_json(force=True)
    kind = data.get('type')
    if kind == 'service-desc':
        name = data.get('serviceName', 'Our Service')
        text = (f"{name}: Outcome-focused delivery with robust QA, clear SLAs, and practical AI accelerators. "
                f"Secure-by-default and designed to scale.")
    elif kind == 'project-summary':
        name = data.get('name', 'Project')
        text = (f"{name}: Delivered with an AI-first, metrics-driven approach. Improved time-to-value and reliability.")
    elif kind == 'team-intro':
        team = data.get('team', [])
        names = ', '.join([f"{m.get('name')} ({m.get('role')})" for m in team])
        text = (f"We are a focused team — {names}. We pair deep engineering with product thinking to deliver outcomes.")
    elif kind == 'blog-summary':
        title = data.get('title', 'Post')
        text = f"{title}: Key takeaways summarized for quick reading."
    elif kind == 'testimonial-rephrase':
        content = data.get('content','')
        text = f"{content} — Rephrased for clarity and impact."
    else:
        text = 'Generated content.'
    return jsonify(text=text)


@ai_bp.route('/analytics-summary', methods=['GET'])
def analytics_summary():
    # In a real app, pull metrics then summarize via LLM
    summary = (
        "Traffic is up 12% WoW, lead quality steady. Recommendation: invest in SEO for services pages and "
        "streamline the careers application flow."
    )
    return jsonify(text=summary)


@ai_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json(force=True)
    msg = data.get('message','')
    # Simple echo chatbot stub
    reply = "Thanks for your message! We can help with AI, web, and cloud. How can we assist?"
    if 'price' in msg.lower():
        reply = "Pricing depends on scope; we offer fixed-price and retainer options."
    return jsonify(reply=reply)
