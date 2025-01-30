import json
import sys
from bingart import BingArt

def generate_images(prompt):
    bing_art = BingArt(auth_cookie_U='1zLhccDWaqcwWnUm9Cywpd0UEur2-DdJAKQcDbro5PXSPvWQ4_4iowH13v2k3emexYYaLC4wj83I3dhc2ON6zneHod7_vobh6kvdaxDexQRdVhskAklnVim_H5p96ZE03LRKUIsARFT6QniXaA2DHwX17zLqN6ejdPF46WxmAzmDYEWgEIVjNshKQAXHAB6iLgje5sZ0sqkaCDw3lEqHjiJalX19YcjbPbXX41KUrXtA')  # Replace '...' with your actual auth cookie
    try:
        print(f"INFO: Generating image for prompt: {prompt}")
        results = bing_art.generate_images(prompt)
        print("INFO: Image generation successful.")
        print(json.dumps(results))  # Convert results to JSON and print
    except Exception as e:
        print(f"ERROR: Error generating image: {e}")
    finally:
        print("INFO: Closing BingArt session.")
        bing_art.close_session()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("ERROR: No prompt provided.")
        print(json.dumps({"error": "No prompt provided"}))
    else:
        generate_images(sys.argv[1])
