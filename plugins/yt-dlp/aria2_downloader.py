import sys
import json
import os
import subprocess
import requests
from urllib.parse import urlparse

def get_filename_from_headers(url):
    try:
        # Send a HEAD request to get headers without downloading the file
        response = requests.head(url, allow_redirects=True)
        
        # If the request was successful, check the headers for a filename
        if response.status_code == 200:
            content_disposition = response.headers.get('Content-Disposition', '')
            if 'filename=' in content_disposition:
                filename = content_disposition.split('filename=')[1].strip('"')
                return filename
        
        return os.path.basename(urlparse(url).path) or "downloaded_file"
    
    except Exception as e:
        print(f"Error getting filename from headers: {e}")
        return "downloaded_file"

try:
    url = sys.argv[1]
    output_dir = sys.argv[2]

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    filename = get_filename_from_headers(url)
    output_file = os.path.join(output_dir, filename)

    # Use aria2c for large file downloads
    command = ['aria2c', '--continue', '--max-connection-per-server=4', '--split=4', '--dir', output_dir, '--out', filename, url]
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    stdout, stderr = process.communicate()

    if process.returncode != 0:
        raise Exception(f"aria2c failed with exit code {process.returncode}: {stderr.decode().strip()}")

    if not os.path.exists(output_file):
        raise Exception(f"Downloaded file not found: {output_file}")

    download_info = {
        'filePath': output_file,
        'error': None,
        'message': 'Download completed successfully'
    }

    print(json.dumps(download_info))
    sys.exit(0)

except Exception as e:
    download_info = {
        'error': True,
        'message': str(e)
    }
    print(json.dumps(download_info))
    sys.exit(1)
