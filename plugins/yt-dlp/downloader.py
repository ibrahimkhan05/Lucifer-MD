import json
import time
import yt_dlp
import sys
from pathlib import Path
import subprocess

def get_available_formats(url):
    ydl_opts = {
        'quiet': True,
        'format': 'bestaudio/best',
        'noplaylist': True,
        'extract_flat': True,
        'logger': None,
        'progress_hooks': [],
        'postprocessor_hooks': [],
        'noconsoletitle': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=False)
            formats = info_dict.get('formats', [])
            return [
                f"{fmt['format_id']}: {fmt.get('height', 'Audio')}p" for fmt in formats
            ]
    except:
        return None  # Return None if format check fails

def download_video(url, output_path, quality='best', start_time=None):
    formats = get_available_formats(url)
    if not formats:
        return None  # Format check failed, return nothing

    format_code = next((fmt.split(':')[0] for fmt in formats if quality in fmt), 'best')

    # Silent subprocess execution
    cmd = [
        'yt-dlp', '-o', str(output_path), '-f', format_code,
        '--quiet', '--no-warnings', '--no-progress', '--no-playlist'
    ]
    
    with open('/dev/null', 'w') as devnull:  # Use 'nul' on Windows
        subprocess.run(cmd, stdout=devnull, stderr=devnull)

    if not Path(output_path).exists():
        return None  # File not found

    file_size = Path(output_path).stat().st_size
    if start_time is None:
        start_time = time.time()
    download_speed = file_size / (time.time() - start_time)

    return output_path, download_speed, file_size

def main(url, output_dir, quality='best'):
    file_name = f"video_{int(time.time())}.mp4"
    output_path = Path(output_dir) / file_name
    start_time = time.time()

    result = download_video(url, output_path, quality, start_time)
    if result:
        output_path, download_speed, file_size = result
        print(json.dumps({"filePath": str(output_path), "downloadSpeed": download_speed, "fileSize": file_size}))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(1)  # Silent exit on incorrect usage

    url = sys.argv[1]
    output_dir = sys.argv[2]
    quality = sys.argv[3] if len(sys.argv) > 3 else 'best'
    main(url, output_dir, quality)
