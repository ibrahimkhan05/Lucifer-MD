import json
import time
import yt_dlp
import sys
import os
from pathlib import Path
import logging
import io
import contextlib

# Logging setup
log_file = 'downloader.log'
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('downloader')

def download_video(url, output_path, format_id='best', start_time=None):
    if start_time is None:
        start_time = time.time()

    # Ensure output directory exists
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info(f"Downloading URL: {url}")
    logger.info(f"Output path: {output_path}")
    logger.info(f"Format ID: {format_id}")

    # Select format
    if format_id == 'best':
        format_spec = 'bestvideo+bestaudio/best'
    elif format_id in ['1080p', '720p', '480p', '360p', '240p', '144p']:
        height = format_id.replace('p', '')
        format_spec = f'bestvideo[height<={height}]+bestaudio/best[height<={height}]'
    else:
        format_spec = format_id

    ydl_opts = {
        'outtmpl': str(output_path),
        'format': format_spec,
        'quiet': True,
        'no_warnings': True,
        'noprogress': True,
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
        'postprocessor_args': [
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-movflags', '+faststart'
        ],
        'logger': logger
    }

    try:
        # Silence stdout during download
        with contextlib.redirect_stdout(io.StringIO()):
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                logger.info("Starting download...")
                ydl.download([url])
                logger.info("Download completed")
    except Exception as e:
        logger.error(f"Download failed: {str(e)}")
        return "Download failed", str(e), None, 0, 0

    actual_path = Path(output_path)
    if not actual_path.exists():
        logger.error(f"File not found after download: {output_path}")
        return "Download failed", "File not found after download", None, 0, 0

    file_size = actual_path.stat().st_size
    download_speed = file_size / (time.time() - start_time)

    logger.info(f"File downloaded: {actual_path}, Size: {file_size}")

    return None, None, str(actual_path), download_speed, file_size

def main(url, output_dir, format_id='best'):
    file_name = f"video_{int(time.time())}.mp4"
    output_path = Path(output_dir) / file_name
    start_time = time.time()

    error, error_message, output_path, download_speed, file_size = download_video(
        url, output_path, format_id, start_time
    )

    if error:
        logger.error(f"Error: {error}, Message: {error_message}")
        result = {"error": error, "message": error_message}
        print(json.dumps(result))
        return

    result = {
        "filePath": str(output_path),
        "downloadSpeed": download_speed,
        "fileSize": file_size
    }
    print(json.dumps(result))
    logger.info(f"Success! Result: {result}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({
            "error": "Usage",
            "message": "python downloader.py <url> <output_dir> [<format_id>]"
        }))
        sys.exit(1)

    url = sys.argv[1]
    output_dir = sys.argv[2]
    format_id = sys.argv[3] if len(sys.argv) > 3 else 'best'
    main(url, output_dir, format_id)
