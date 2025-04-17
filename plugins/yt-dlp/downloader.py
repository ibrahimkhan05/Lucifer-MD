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
            
            # Filter out formats that don't have video or have extremely low resolution
            video_formats = []
            audio_only_formats = []
            
            for fmt in formats:
                format_id = fmt.get('format_id', 'unknown')
                height = fmt.get('height')
                width = fmt.get('width')
                vcodec = fmt.get('vcodec', '')
                acodec = fmt.get('acodec', '')
                format_label = fmt.get('format_note') or fmt.get('format', 'Unknown')
                file_size = fmt.get('filesize') or fmt.get('filesize_approx')
                ext = fmt.get('ext', 'unknown')
                
                # Skip formats without necessary information
                if not format_id or format_id == 'unknown':
                    continue
                    
                # Calculate size string
                if file_size is not None:
                    try:
                        size_str = f"{int(file_size) / (1024 * 1024):.2f} MB"
                    except:
                        size_str = 'Size not available'
                else:
                    size_str = 'Size not available'
                
                # Skip formats with no video or extremely low resolution
                has_video = vcodec != 'none' and height is not None and height > 0
                has_audio = acodec != 'none'
                
                # Create format info
                format_info = {
                    'id': format_id,
                    'size': size_str,
                    'ext': ext
                }
                
                if has_video:
                    format_info['label'] = f"{height}p ({format_label})"
                    video_formats.append(format_info)
                elif has_audio:
                    format_info['label'] = f"Audio ({format_label})"
                    audio_only_formats.append(format_info)
            
            # Add combined formats for better quality
            combined_formats = []
            
            # Add best video+audio option
            combined_formats.append({
                'id': 'best',
                'label': 'Best Quality (Auto)',
                'size': 'Variable',
                'ext': 'mp4'
            })
            
            # Sort video formats by height (resolution)
            video_formats.sort(key=lambda x: int(x['label'].split('p')[0]) if 'p' in x['label'] else 0, reverse=True)
            
            # Return only the most useful formats (best combined, top video formats, top audio)
            result_formats = combined_formats + video_formats[:6]
            if audio_only_formats:
                result_formats.append(audio_only_formats[0])
                
            return json.dumps(result_formats)
            
        except Exception as e:
            return json.dumps({'error': str(e)})

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(fetch_qualities(url))
    else:
        print(json.dumps({'error': 'No URL provided'}))
        sys.exit(1)