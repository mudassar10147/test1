import pandas as pd
import json
import openai
from dateutil import parser
from enum import Enum

# Function to get headings and first data row from CSVs
def GetHeadingsAndFirstRowFromCSV(df):
    headings = ""
    data = ""
    first_row = df.iloc[0]
    first_row_dict = first_row.to_dict()
    for col in df.columns:
        if len(headings) > 0:
            headings = headings+", "
            data = data + ", "
        headings = headings + col
        data = data + str(first_row_dict[col])
    return headings + '\n' + data

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


# Function to compile and sanitize the output data
def SanitizeData(data):
    source_data = {}
    for index, row in source_df.iterrows():
        # Access individual columns by column name
        for key in data.keys():
            item = row[data[key]]
            if key == "Date":
                try:
                    parsed_date = parser.parse(item)
                    item = parsed_date.strftime(output_date_format)
                except ValueError:
                    print("Unable to determine the input date format.")
            elif key == "Premium":
                try:
                    item = str(int(item))
                except Exception as e:
                    print("Price Conversion Exception", str(e))
            elif key == "PolicyNumber":
                if "-" in item:
                    item = item.replace("-", "")
            elif key == "Plan":
                if Plans.Gold.name in item:
                    item = Plans.Gold.name
                elif Plans.Silver.name in item:
                    item = Plans.Silver.name
                elif Plans.Bronze.name in item:
                    item = Plans.Bronze.name
            try:
                source_data[key].append(item)
            except:
                source_data[key] = []; 
                source_data[key].append(item)
    return source_data

Plans = Enum('Plans', ['Gold', 'Silver', 'Bronze'])
output_date_format = "%d-%m-%Y"
source_data = {}

# Read the master CSV and source CSV
print("Reading CSV files.")
master_df = pd.read_csv('template.csv')
source_df = pd.read_csv('table_B.csv')

# Read the master CSV and source CSV
print("Parsing CSV files.")
master_headings = GetHeadingsAndFirstRowFromCSV(master_df)
source_headings = GetHeadingsAndFirstRowFromCSV(source_df)

# Asking GPT models for Mapping
print("Waiting for OpenAI to respond...")
data = OpenAiToMapCSVHeadings(master_headings, source_headings)

# Sanitizing data
print("Sanitizing and combining two CSVs")
source_data = SanitizeData(data)

# Saving to file
print("Saving data to file")
new_rows = pd.DataFrame(source_data)
combined_data = pd.concat([master_df, new_rows], ignore_index=True)
combined_data.to_csv('template.csv', index=False)
