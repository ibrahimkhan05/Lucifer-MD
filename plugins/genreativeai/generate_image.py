import json
import sys
from bingart import BingArt

def generate_images(prompt):
    # Initialize BingArt with your auth cookie
    bing_art = BingArt(auth_cookie_U='1zLhccDWaqcwWnUm9Cywpd0UEur2-DdJAKQcDbro5PXSPvWQ4_4iowH13v2k3emexYYaLC4wj83I3dhc2ON6zneHod7_vobh6kvdaxDexQRdVhskAklnVim_H5p96ZE03LRKUIsARFT6QniXaA2DHwX17zLqN6ejdPF46WxmAzmDYEWgEIVjNshKQAXHAB6iLgje5sZ0sqkaCDw3lEqHjiJalX19YcjbPbXX41KUrXtA')  # Replace '...' with your actual auth cookie

    try:
        # Log the start of the image generation process
        print(f"INFO: Generating image for prompt: {prompt}")
        
        # Generate the image(s)
        results = bing_art.generate_images(prompt)
        
        # Log successful generation and print results
        print("INFO: Image generation successful.")
        print("INFO: Image Data:")
        print(json.dumps(results))  # Print the generated image data in JSON format

    except Exception as e:
        # Log any errors that occur during the process
        print(f"ERROR: Error generating image: {e}")
    
    finally:
        # Log the closing of the session
        print("INFO: Closing BingArt session.")
        bing_art.close_session()

if __name__ == "__main__":
    # Check if prompt is provided
    if len(sys.argv) < 2:
        print("ERROR: No prompt provided.")
        print(json.dumps({"error": "No prompt provided"}))
    else:
        # Generate images with the provided prompt
        generate_images(sys.argv[1])
