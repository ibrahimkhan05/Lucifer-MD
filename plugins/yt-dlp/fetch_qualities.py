import sys
import json
import yt_dlp

def fetch_qualities(url):
    ydl_opts = {
        'quiet': True,
        'format': 'bestaudio/best'
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info_dict = ydl.extract_info(url, download=False)
            formats = info_dict.get('formats', [])

            format_list = []
            for fmt in formats:
                height = fmt.get('height')
                format_id = fmt.get('format_id', 'unknown')
                format_label = fmt.get('format_note') or fmt.get('format', 'Unknown')
                file_size = fmt.get('filesize') or fmt.get('filesize_approx')

                if file_size is not None:
                    try:
                        size_str = f"{int(file_size) / (1024 * 1024):.2f} MB"
                    except:
                        size_str = 'Size not available'
                else:
                    size_str = 'Size not available'

                if height:
                    label = f"{height}p ({format_label})"
                else:
                    label = f"Audio ({format_label})"

                format_list.append({
                    'id': format_id,
                    'label': label,
                    'size': size_str
                })

            return json.dumps(format_list)
        except Exception as e:
            return json.dumps({'error': str(e)})

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(fetch_qualities(url))
    else:
        print(json.dumps({'error': 'No URL provided'}))
        sys.exit(1)
