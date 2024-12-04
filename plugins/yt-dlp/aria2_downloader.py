import sys
import json
import os
import subprocess

# Get URL and output directory from command line arguments
url = sys.argv[1]
output_dir = sys.argv[2]

# Create the download directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Set the output file path (ensure it has a correct extension and name pattern)
output_file = os.path.join(output_dir, "%(title)s.%(ext)s")

# Run aria2c to download the file
try:
    command = ['aria2c', '-d', output_dir, '-o', output_file, url]
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    stdout, stderr = process.communicate()

    # Check if there was an error
    if process.returncode != 0:
        raise Exception(stderr.decode())

    # Parse aria2c output to get the file path
    stdout_str = stdout.decode()
    # Extract filename from the output string or make sure it's generated properly
    file_path = os.path.join(output_dir, stdout_str.split()[-1])  # Adjust if needed

    # Check if the file exists
    if not os.path.exists(file_path):
        raise Exception(f"Downloaded file not found: {file_path}")

    # Prepare download info
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
