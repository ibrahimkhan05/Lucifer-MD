import json
import sys
from bingart import BingArt

def generate_images(prompt):
    # Initialize BingArt with your auth cookie
    bing_art = BingArt(auth_cookie_U='1nhxJX0vf9R0bW7QD27KRrFHzjh8MUpeL355Az4nZ7MO8reQj_3drCOktBDpC-7fnnkXdaYg7uEkij0odqnoh-Qbkru0RCFdelL_22Ts2g8vhrocS4-9mlxb0KoY6geRO779VfkzI0ryuczhuQjHxVvcMBsuKJvKm1gFuVHJs2-Ev2bhwX4amgpvP0WCB0GrwafGQDN8KgJacdiZBlvx9dUTg82H3iLR3oGYsoyRrTFI')  # Replace '...' with your actual auth cookie

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
