import sys
import json
import os
import subprocess
import requests
from urllib.parse import urlparse, parse_qs

def get_filename_from_headers(url):
    try:
        # Send a HEAD request to get headers without downloading the file
        response = requests.head(url, allow_redirects=True)
        # Check if content-disposition is available to infer filename
        content_disposition = response.headers.get('Content-Disposition', '')
        if 'filename=' in content_disposition:
            filename = content_disposition.split('filename=')[1].strip('"')
            return filename
        # Otherwise, use the last part of the URL as the fallback filename
        return os.path.basename(urlparse(url).path) or "downloaded_file"
    except Exception as e:
        print(f"Error getting filename from headers: {e}")
        return "downloaded_file"

try:
    # Get URL and output directory from command-line arguments
    url = sys.argv[1]
    output_dir = sys.argv[2]

    # Ensure the output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Extract the filename, trying to use the headers if possible
    filename = get_filename_from_headers(url)

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
