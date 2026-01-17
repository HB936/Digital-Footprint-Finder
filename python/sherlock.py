import sys
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import subprocess
import tempfile
import os
import json
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/search', methods=['POST'])

def search_username():

    data = request.get_json()

    username = data.get('username')



    if not username:

        return Response("Username is required", status=400)



    def generate_results():

        try:

            sherlock_path = os.path.join(os.path.dirname(__file__), "..", "sherlock", "sherlock_project", "sherlock.py")
            print(f"DEBUG: sherlock_path: {sherlock_path}", file=sys.stderr)

            process = subprocess.Popen(

                [os.path.join(os.getcwd(), ".venv", "Scripts", "python.exe"), sherlock_path, username, "--timeout", "10", "--print-found", "--no-color"],

                stdout=subprocess.PIPE,

                stderr=subprocess.PIPE,

                text=True,

                bufsize=1,

                universal_newlines=True

            )



            for line in iter(process.stdout.readline, ''):

                if line.startswith('[+]'):

                    parts = line.split(': ')

                    if len(parts) > 1:

                        platform = parts[0].replace('[+] ', '').strip()

                        url = ': '.join(parts[1:]).strip()

                        result = {

                            'platform': platform,

                            'exists': True,

                            'url': url

                        }

                        yield f"data: {json.dumps(result)}\n\n"

            

            process.stdout.close()

            process.wait()



        except Exception as e:

            traceback.print_exc()

            yield f"data: {json.dumps({'error': str(e)})}\n\n"



    return Response(generate_results(), mimetype='text/event-stream')
    
if __name__ == '__main__':
    app.run(debug=True, port=5001)
