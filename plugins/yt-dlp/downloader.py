import json
import time
import yt_dlp
import sys
import os
from pathlib import Path
import logging
import io
import contextlib

# Set up logging to a file instead of stdout
log_file = 'downloader.log'
logging.basicConfig(filename=log_file, level=logging.INFO, 
                   format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('downloader')

def download_video(url, output_path, format_id='best', start_time=None):
    """
    Download a video with specified format ID
    """
    if start_time is None:
        start_time = time.time()
        
    # Create output directory if it doesn't exist
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"Downloading URL: {url}")
    logger.info(f"Output path: {output_path}")
    logger.info(f"Format ID: {format_id}")
    
    # Process format_id - handle direct format IDs from the quality selector
    if format_id == 'best':
        format_spec = 'bestvideo+bestaudio/best'
    elif format_id in ['1080p', '720p', '480p', '360p', '240p', '144p']:
        # Handle resolution-based format selection with improved format specification
        height = format_id.replace('p', '')
        # Ensure we always get video+audio, with proper fallbacks
        format_spec = f'bestvideo[height<={height}]+bestaudio/best[height<={height}]/bestvideo+bestaudio/best'
        logger.info(f"Using resolution-based format spec: {format_spec}")
    else:
        # Direct format ID
        format_spec = format_id
    
    ydl_opts = {
        'outtmpl': str(output_path),
        'format': format_spec,
        'quiet': True,  # Disable normal output
        'no_warnings': True,  # Disable warnings
        'noprogress': True,  # Disable progress
        'noplaylist': True,
        'merge_output_format': 'mp4',
        'postprocessors': [
            {
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            },
            {
                'key': 'FFmpegMetadata',
                'add_metadata': True,
            }
        ],
        'logger': logger  # Use our custom logger
    }

    try:
        # Redirect stdout to capture yt-dlp output
        with contextlib.redirect_stdout(io.StringIO()):
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                logger.info("Starting download...")
                
                # Log the selected format before downloading
                try:
                    info_dict = ydl.extract_info(url, download=False)
                    selected_format = ydl.build_format_selector(format_spec)(info_dict)
                    logger.info(f"Selected format: {selected_format}")
                except Exception as e:
                    logger.warning(f"Could not determine selected format beforehand: {str(e)}")
                
                # Now download the video
                ydl.download([url])
                logger.info("Download completed")
    except Exception as e:
        logger.error(f"Download failed: {str(e)}")
        return "Download failed", str(e), None, 0, 0

    # Verify the file exists
    actual_path = Path(output_path)
    if not actual_path.exists():
        logger.error(f"File not found after download: {output_path}")
        return "Download failed", "File not found after download", None, 0, 0

    # Check if the file is valid video with audio
    try:
        verify_cmd = f'ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "{actual_path}"'
        with os.popen(verify_cmd) as proc:
            video_packets = proc.read().strip()
        
        if not video_packets or int(video_packets or '0') == 0:
            logger.error(f"Downloaded file has no video stream: {output_path}")
            # Try to download again with a more specific format
            if not format_id.startswith('retry_'):
                logger.info("Retrying with explicit video+audio format")
                # Delete the bad file
                os.remove(actual_path)
                # Retry with a clear video+audio specification
                return download_video(url, output_path, 'retry_bestvideo+bestaudio/best', start_time)
    except Exception as verify_err:
        logger.warning(f"Could not verify video content: {str(verify_err)}")

    # Get file size and calculate download speed
    file_size = actual_path.stat().st_size
    download_speed = file_size / (time.time() - start_time)
    
    logger.info(f"File downloaded: {actual_path}, Size: {file_size}")
    
    # Return success with file information
    return None, None, str(actual_path), download_speed, file_size

def main(url, output_dir, format_id='best'):
    # Generate unique file name
    file_name = f"video_{int(time.time())}.mp4"
    output_path = Path(output_dir) / file_name
    start_time = time.time()

    # Download the video
    error, error_message, output_path, download_speed, file_size = download_video(url, output_path, format_id, start_time)

    # Handle errors
    if error:
        logger.error(f"Error: {error}, Message: {error_message}")
        result = {"error": error, "message": error_message}
        print(json.dumps(result))
        return

    # Return the result as JSON
    result = {
        "filePath": str(output_path),
        "downloadSpeed": download_speed,
        "fileSize": file_size
    }
    # Print ONLY the JSON result to stdout
    print(json.dumps(result))
    logger.info(f"Success! Result: {result}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage", "message": "python downloader.py <url> <output_dir> [<format_id>]"}))
        sys.exit(1)

    url = sys.argv[1]
    output_dir = sys.argv[2]
    format_id = sys.argv[3] if len(sys.argv) > 3 else 'best'
    main(url, output_dir, format_id)