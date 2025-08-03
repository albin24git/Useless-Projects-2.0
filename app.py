import base64
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS 
import os 

import ai_generator

app = Flask(__name__)

CORS(app)

@app.route('/')
def index():
    return "<h1>NameAI Backend is Running!</h1><p>This is the server, not the user-facing website.</p>"

@app.route('/generate_name', methods=['POST', 'OPTIONS'])
def generate_name():
    print("🤖 Backend received a request to /generate_name...")

    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.json
        image_data_url = data['image']
        mode = data['mode'] 
        context = data.get('context', 'self') 

       
        image_bytes = base64.b64decode(image_data_url.split(',')[1])


        if mode == 'self':
            result_text = ai_generator.suggest_self_name(image_bytes, subject=context)
        elif mode == 'partner':
           
            result_text = ai_generator.suggest_partner_name(image_bytes)
        else:
           
            return jsonify({'error': 'Invalid mode specified.'}), 400

       
        lines = result_text.strip().split('\n')
    
        if len(lines) >= 2:
            name = lines[0].replace('NAME:', '').strip()
            reason = lines[1].replace('REASON:', '').strip()
        else:
            raise ValueError("AI response was not in the expected format.")

        print(f"✅ AI processing complete. Sending back: {name}")
        return jsonify({
            'name': name,
            'reason': reason
        })

    except Exception as e:
        print(f"❌ An error occurred in the backend: {e}")
        return jsonify({'error': 'An internal server error occurred. Please check the logs.'}), 500

