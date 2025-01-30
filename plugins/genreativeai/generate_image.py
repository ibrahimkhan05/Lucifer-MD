import json
import sys
from bingart import BingArt

def generate_images(prompt):
    # Initialize BingArt with your auth cookie
    bing_art = BingArt(auth_cookie_U='1zLhccDWaqcwWnUm9Cywpd0UEur2-DdJAKQcDbro5PXSPvWQ4_4iowH13v2k3emexYYaLC4wj83I3dhc2ON6zneHod7_vobh6kvdaxDexQRdVhskAklnVim_H5p96ZE03LRKUIsARFT6QniXaA2DHwX17zLqN6ejdPF46WxmAzmDYEWgEIVjNshKQAXHAB6iLgje5sZ0sqkaCDw3lEqHjiJalX19YcjbPbXX41KUrXtA')  # Replace '...' with your actual auth cookie

    try:
        # Generate the image(s)
        results = bing_art.generate_images(prompt)
        
        # Send only valid JSON as output
        print(json.dumps(results))  # Print the generated image data in JSON format

    except Exception as e:
        # Return error as JSON
        print(json.dumps({"error": str(e)}))
    
    finally:
        # Close the BingArt session without logging
        bing_art.close_session()

if __name__ == "__main__":
    # Check if prompt is provided
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No prompt provided"}))
    else:
        # Generate images with the provided prompt
        generate_images(sys.argv[1])
