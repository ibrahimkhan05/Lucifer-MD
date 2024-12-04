import sys
import json
import os
import subprocess
from urllib.parse import urlparse

# Get URL and output directory from command line arguments
url = sys.argv[1]
output_dir = sys.argv[2]

# Ensure the download directory exists
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Attempt to extract a valid filename from the URL
filename = os.path.basename(urlparse(url).path)

# If filename extraction failed (empty), set a default name
if not filename:
    filename = "downloaded_file"

# Set the output file path with the determined filename
output_file = os.path.join(output_dir, filename)

# Run aria2c to download the file, handling any file type
try:
    command = ['aria2c', '-d', output_dir, '-o', filename, url]
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    stdout, stderr = process.communicate()

    # Check if there was an error
    if process.returncode != 0:
        raise Exception(stderr.decode())

    # Prepare the file path
    file_path = os.path.join(output_dir, filename)

    # Check if the file exists
    if not os.path.exists(file_path):
        raise Exception(f"Downloaded file not found: {file_path}")

    download_info = {
        'filePath': file_path,
        'error': None,
        'message': 'Download completed successfully'
    }

    print(json.dumps(download_info))  # Output as JSON to JavaScript
except Exception as e:
    download_info = {
        'error': True,
        'message': str(e)
    }
    print(json.dumps(download_info))  # Output error as JSON to JavaScript
