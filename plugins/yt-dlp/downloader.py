import json
import time
import yt_dlp
import sys
from pathlib import Path

def get_available_formats(url):
    ydl_opts = {
        'quiet': True,
        'format': 'bestaudio/best',
        'noplaylist': True,
        'extract_flat': True,
        'logger': None,  # Disable yt-dlp logs
        'progress_hooks': [],  # No progress updates
        'postprocessor_hooks': [],  # No post-processing logs
        'noconsoletitle': True  # Prevents updates to terminal title
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=False)
            formats = info_dict.get('formats', [])
            format_list = [
                f"{fmt['format_id']}: {fmt['height']}p" if 'height' in fmt else f"{fmt['format_id']}: Audio"
                for fmt in formats
            ]
            return format_list, None
    except Exception:
        return None, None  # Silence errors

def download_video(url, output_path, quality='best', start_time=None):
    formats, _ = get_available_formats(url)
    if not formats:
        return "Format check failed", None, None, 0, 0  # Keep function structure same

    format_code = next((fmt.split(':')[0] for fmt in formats if quality in fmt), 'best')

    ydl_opts = {
        'outtmpl': str(output_path),
        'format': format_code,
        'quiet': True,
        'noprogress': True,
        'noplaylist': True,
        'concurrent_fragment_downloads': 4,
        'logger': None  # Silence yt-dlp logs
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception:
        return "Download failed", None, None, 0, 0  # Silent failure

    if not Path(output_path).exists():
        return "Download failed", None, None, 0, 0  # No logs, just return status

    file_size = Path(output_path).stat().st_size
    if start_time is None:
        start_time = time.time()
    download_speed = file_size / (time.time() - start_time)

    return None, None, output_path, download_speed, file_size

def main(url, output_dir, quality='best'):
    file_name = f"video_{int(time.time())}.mp4"  # Keep naming logic same
    output_path = Path(output_dir) / file_name
    start_time = time.time()

    error, _, output_path, download_speed, file_size = download_video(url, output_path, quality, start_time)

    if error:
        return  # No logging, just silent exit

    print(json.dumps({"filePath": str(output_path), "downloadSpeed": download_speed, "fileSize": file_size}))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(1)  # Silent exit on incorrect usage

    url = sys.argv[1]
    output_dir = sys.argv[2]
    quality = sys.argv[3] if len(sys.argv) > 3 else 'best'
    main(url, output_dir, quality)
