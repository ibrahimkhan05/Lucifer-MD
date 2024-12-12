import sys
import json
import os
import subprocess
from urllib.parse import urlparse

try:
    # Get URL and output directory from command-line arguments
    url = sys.argv[1]
    output_dir = sys.argv[2]

    # Ensure the output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Extract the filename from the URL
    filename = os.path.basename(urlparse(url).path) or "downloaded_file"

    # Set the full path for the downloaded file
    output_file = os.path.join(output_dir, filename)

    # Download the file using aria2c
    command = ['aria2c', '-d', output_dir, '-o', filename, url]
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    stdout, stderr = process.communicate()

    # Check if the process exited with an error code
    if process.returncode != 0:
        raise Exception(f"aria2c failed with exit code {process.returncode}: {stderr.decode().strip()}")

    # Check if the file exists
    if not os.path.exists(output_file):
        raise Exception(f"Downloaded file not found: {output_file}")

    # Prepare success response
    download_info = {
        'filePath': output_file,
        'error': None,
        'message': 'Download completed successfully'
    }

    print(json.dumps(download_info))
    sys.exit(0)  # Explicitly exit with success code
except Exception as e:
    # Prepare error response
    download_info = {
        'error': True,
        'message': str(e)
    }
    print(json.dumps(download_info))
    sys.exit(1)  # Explicitly exit with error code
