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
        file_path = audio.download(filename=f"{yt.title}.mp3")
        print(file_path)
    except Exception as e:
        print(f"ERROR::{str(e)}")

if __name__ == "__main__":
    query = " ".join(sys.argv[1:])
    download_audio(query)
