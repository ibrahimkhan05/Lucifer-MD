import sys
import json
import os
import subprocess
from urllib.parse import urlparse

try:
    url = sys.argv[1]
    output_dir = sys.argv[2]

    # Ensure the download directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Extract filename from URL
    filename = os.path.basename(urlparse(url).path) or "downloaded_file"

    # Set the output file path
    output_file = os.path.join(output_dir, filename)

    # Download file using aria2c
    command = ['aria2c', '-d', output_dir, '-o', filename, url]
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    stdout, stderr = process.communicate()

    if process.returncode != 0:
        raise Exception(stderr.decode())

    file_path = os.path.join(output_dir, filename)

    if not os.path.exists(file_path):
        raise Exception(f"Downloaded file not found: {file_path}")

    download_info = {
        'filePath': file_path,
        'error': None,
        'message': 'Download completed successfully'
    }

    print(json.dumps(download_info))
except Exception as e:
    download_info = {
        'error': True,
        'message': str(e)
    }
    print(json.dumps(download_info))
