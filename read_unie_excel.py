
import pandas as pd
import json
import glob
import os

# Find the file (handling potential encoding/normalization issues)
files = glob.glob('app/master-unie/*.xlsx')
if not files:
    print("No Excel file found")
    exit(1)

file_path = files[0]
print(f"Reading file: {file_path}")

try:
    df = pd.read_excel(file_path)
    # Clean keys and values
    df.columns = df.columns.astype(str)
    df = df.where(pd.notnull(df), None)
    
    records = df.to_dict(orient='records')
    print(json.dumps(records, ensure_ascii=False, indent=2, default=str))
except Exception as e:
    print(f"Error reading excel: {e}")
