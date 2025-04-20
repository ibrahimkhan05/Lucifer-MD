#!/usr/bin/env python3
import sys
import os
import json
import time
import myjdapi
import argparse
from datetime import datetime

def main():
    parser = argparse.ArgumentParser(description='Download files using JDownloader')
    parser.add_argument('url', help='URL to download')
    parser.add_argument('output_dir', help='Directory to save downloads')
    args = parser.parse_args()

    # JDownloader credentials - hardcoded but you should consider using environment variables
    jd_user = "killerkhankiller02@gmail.com"
    jd_pass = "Sahil@12345"

    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)

    try:
        # Connect to JDownloader
        jd = myjdapi.Myjdapi()
        jd.connect(jd_user, jd_pass)
        
        # Get the first device
        devices = jd.list_devices()
        if not devices:
            result = {
                'error': True,
                'message': 'No JDownloader devices found. Please ensure JDownloader is running and connected to your My.JDownloader account.'
            }
            print(json.dumps(result))
            return
            
        device = jd.get_device(devices[0])
        
        # Add the link to JDownloader
        device.linkgrabber.add_links([{"autostart": True, "links": args.url, "packageName": f"Download_{datetime.now().strftime('%Y%m%d_%H%M%S')}"}])
        
        # Wait for the link to be processed
        time.sleep(5)
        
        # Check if the link was added successfully
        packages = device.linkgrabber.query_packages()
        if not packages:
            result = {
                'error': True,
                'message': 'Failed to add link to JDownloader. The link might be invalid.'
            }
            print(json.dumps(result))
            return
        
        # Get file information
        links = device.linkgrabber.query_links()
        if not links:
            result = {
                'error': True,
                'message': 'No downloadable links found. The URL might be invalid or unsupported.'
            }
            print(json.dumps(result))
            return
            
        # Get file size (in bytes)
        file_size = links[0].get('bytesTotal', 0)
        
        # Check if file size is too large (1930 MB)
        if file_size > 1930 * 1024 * 1024:
            result = {
                'error': True,
                'message': f'File size ({round(file_size/(1024*1024), 2)} MB) exceeds the maximum limit of 1930 MB',
                'size': file_size
            }
            print(json.dumps(result))
            return
            
        # Get file name
        file_name = links[0].get('name', f'download_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
        
        # Set download path
        download_path = os.path.join(args.output_dir, file_name)
        
        # Move to downloads
        device.linkgrabber.move_to_downloadlist()
        
        # Wait for the download to start
        time.sleep(3)
        
        # Check download status until completed
        max_wait_time = 3600  # Maximum wait time in seconds (1 hour)
        wait_interval = 5
        waited_time = 0
        
        while waited_time < max_wait_time:
            downloads = device.downloads.query_packages()
            if not downloads:
                time.sleep(wait_interval)
                waited_time += wait_interval
                continue
                
            download_status = device.downloads.query_links()
            
            if not download_status:
                time.sleep(wait_interval)
                waited_time += wait_interval
                continue
                
            all_finished = True
            for dl in download_status:
                if dl.get('status') != 'Finished':
                    all_finished = False
                    break
                    
            if all_finished:
                # Download completed
                final_file_path = os.path.join(args.output_dir, file_name)
                
                # Ensure the file exists
                if not os.path.exists(final_file_path):
                    # Try to find the file using the JDownloader download path
                    jd_download_path = dl.get('downloadPath', '')
                    if jd_download_path and os.path.exists(jd_download_path):
                        final_file_path = jd_download_path
                
                result = {
                    'error': False,
                    'message': 'Download completed successfully',
                    'filePath': final_file_path,
                    'fileName': file_name,
                    'fileSize': file_size
                }
                print(json.dumps(result))
                return
                
            # Wait before checking again
            time.sleep(wait_interval)
            waited_time += wait_interval
            
        # If we've reached here, the download didn't complete in time
        result = {
            'error': True,
            'message': 'Download timed out. Please try again or check JDownloader for issues.'
        }
        print(json.dumps(result))
        
    except Exception as e:
        result = {
            'error': True,
            'message': f'Error: {str(e)}'
        }
        print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({'error': True, 'message': 'Missing required arguments: url and output_dir'}))
    else:
        main()