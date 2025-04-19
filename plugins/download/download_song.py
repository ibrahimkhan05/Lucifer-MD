# download_song.py
import sys
from pytube import Search, YouTube
import os

def download_audio(song_name):
    try:
        search = Search(song_name)
        video = search.results[0]
        yt = YouTube(video.watch_url)
        audio = yt.streams.filter(only_audio=True).order_by('abr').desc().first()
        
        file_name = f"{yt.title}.mp3"
        safe_file_name = "".join(c for c in file_name if c.isalnum() or c in (' ', '.', '_', '-')).rstrip()
        file_path = audio.download(filename=safe_file_name)
        print(file_path)  # Output path to Node.js
    except Exception as e:
        print(f"ERROR::{str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("ERROR::No song name provided")
    else:
        query = " ".join(sys.argv[1:])
        download_audio(query)
