
import base64
from flask import Flask, render_template, request, jsonify

import ai_generator

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_name', methods=['POST'])
def generate_name():
    print("🤖 Backend received a request to /generate_name...")

    try:
        data = request.json
        image_data_url = data['image']
        mode = data['mode'] 
        context = data.get('context', 'self') 

        # Decode the Base64 image data sent from the browser canvas
        image_bytes = base64.b64decode(image_data_url.split(',')[1])

        # --- Call the correct function from our AI module based on the mode ---
        if mode == 'self':
            # We pass the context ('self' or 'father') to the AI function
            result_text = ai_generator.suggest_self_name(image_bytes, subject=context)
        elif mode == 'partner':
            # The partner function doesn't need a special context, it just analyzes the photo
            result_text = ai_generator.suggest_partner_name(image_bytes)
        else:
            # Handle an unexpected mode to prevent errors
            return jsonify({'error': 'Invalid mode specified.'}), 400

        # --- Parse the AI's clean, two-line response ---
        # This makes the data easy for JavaScript to use.
        lines = result_text.strip().split('\n')
        
        # Add a check to prevent crashing if the AI response is malformed
        if len(lines) >= 2:
            name = lines[0].replace('NAME:', '').strip()
            reason = lines[1].replace('REASON:', '').strip()
        else:
            # If the response is not what we expect, send a graceful error
            raise ValueError("AI response was not in the expected format.")

        print(f"✅ AI processing complete. Sending back: {name}")

        # Send the parsed data back to the browser as a clean JSON object
        return jsonify({
            'name': name,
            'reason': reason
        })

    except Exception as e:
        # This is a robust error handler for any failure in the process
        print(f"❌ An error occurred in the backend: {e}")
        return jsonify({'error': 'An internal server error occurred. Please check the logs.'}), 500


# This allows us to run the server by typing 'python app.py'
if __name__ == '__main__':
    app.run(debug=True)