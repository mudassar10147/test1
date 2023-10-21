from flask import Flask, jsonify, request, send_from_directory
import pandas as pd
import json
import openai
from dateutil import parser
from enum import Enum
import os
from flask_cors import CORS

basedir = os.path.abspath(os.path.dirname(__file__))

DRIVE_PATH = basedir+"/build"
app = Flask(__name__, static_folder=DRIVE_PATH)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


Plans = Enum('Plans', ['Gold', 'Silver', 'Bronze'])
output_date_format = "%d-%m-%Y"
source_data = {}

# Function to call OpenAI API
def OpenAiToMapCSVHeadings(master, source):
    data = {}
    openai.api_key = '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'
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content":"You only return 'JSON' as a response to all queries. Result is a json dictionary against 'mapping' key. You also check if a value against heading is not correct you find an alternate relevant column heading."},
                {"role": "user", "content":f"""
                    Map the columns from the master CSV to the source CSV and return the JSON response from following data: 
                    Master CSV:
                        '{master}'
                    Source CSV:
                        '{source}'
                    
                    Give priority to full names.
                """}
            ],
            temperature=0
        )
        try:
            json_data = json.loads(response.choices[0].message.content)
            try:
                if "mapping" in json_data.keys():
                    data = json_data["mapping"]
                else:
                    data = json_data
            except Exception as e:
                print("Mapping exception", str(e))
        except Exception as e:
            print("Invalid json", str(e))
    except Exception as e:
        print(str(e)) 
    return data


def CombineHeadingsAndFirstRow(headings, data):
    temp_headings = ""
    temp_row = ""
    for idx, item in enumerate(headings):
        if len(temp_headings) > 0:
            temp_headings = temp_headings+", "
            temp_row = temp_row + ", "
        temp_headings = temp_headings + item
        temp_row = temp_row + str(data[idx])
    return temp_headings + '\n' + temp_row


@app.route('/api/compare', methods=['POST'])
def welcome():
    data = request.get_json()
    template_headings = data["template_headings"]
    template_rows = data["template_rows"]

    source_headings = data["source_headings"]
    source_rows = data["source_rows"]
    template = CombineHeadingsAndFirstRow(template_headings, template_rows)
    source = CombineHeadingsAndFirstRow(source_headings, source_rows)
    return OpenAiToMapCSVHeadings(template, source)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(use_reloader=True, port=5000, threaded=True, host='0.0.0.0')
