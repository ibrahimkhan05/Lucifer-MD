import json
import sys
from bingart import BingArt

def generate_images(prompt):
    # Initialize BingArt with your auth cookies (ensure these are valid)
    import json
import sys
from bingart import BingArt

def generate_images(prompt):
    """Generate images using BingArt API."""
    # Initialize BingArt with authentication cookies
   bing_art = BingArt (
     auth_cookie_U='1nhxJX0vf9R0bW7QD27KRrFHzjh8MUpeL355Az4nZ7MO8reQj_3drCOktBDpC-7fnnkXdaYg7uEkij0odqnoh-Qbkru0RCFdelL_22Ts2g8vhrocS4-9mlxb0KoY6geRO779VfkzI0ryuczhuQjHxVvcMBsuKJvKm1gFuVHJs2-Ev2bhwX4amgpvP0WCB0GrwafGQDN8KgJacdiZBlvx9dUTg82H3iLR3oGYsoyRrTFI', 
     auth_cookie_KievRPSSecAuth='FACKBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACNFgPqIOv4tXSASMJ1vcq1ZQ1eDCxE8T5fq5jrERaCsJqmdE8KHh36ZpehcQBYusXpG8glokBbPCE6+SxlxPwUqaI93x3pfOcs4on72WG+E/G2TNSdqe4B9gopIz8uTe6T3h6n2yp4jlv+aucm8lJEQn2sMrFHbkF08F34qEFHNWiQey4Volc8ItcKErx6703UanLbwMlqQAmorstppgCVFsdKzWhvCWxsB1uAC+IRo8D2ZqjTVV8xuCe78tIJNwzmfgPB5n9LvpD3/7kYcgM9AF9yCPlHrr0XcnQHpHd0JLThfVnZ7in4xqS7kcZtrvd18HJUfVxNOjnBXGESJcPToP4ZyvMnWhTEB3bGBPEK/4SYd+pRd79sjzs1vtSC1LBDH4vMmXqG+K3i0TAvFibqM9/SV2hyZ7YG/EeeAdIePs2JLjHFQYJyTl2Jr9CLyKDzosWbt1+KGolDBprUHWb9KlR/BfYDKfEU2Eoc1y8hmzZC4BNHw+DmpeuHgangdhG33ySklE7POwZ1sXFBRiXYrtpUye6eF9oZkKJUWBQOefukXIKiOx+kwsHsYgTMSIJPOaauSVLevSTs37c8c4S6YwsPPrgwT86iWZB1FX+5IFHy2Nud4aIzv+/NGAGfQWK5fqD/QYWNJCwIlHhLwyoAwQDAs5BziYQfR5GG2qPZ+yyW4R2yDS0MP9Fvf2I2LjVPs/acz8onxrg3zvPQCNfAzSnlHvqKC5BllLp8bQ88dsl3yl4jWbz/CqmoTphvoxMmxkPi0VKhKu9Qeft99rs5yxDzvvkUXTWsuh7IpElhlTN4wcRxJL8y2cs0Z1lz8/GsQ5wfJ7rrSPZcJQWrnuYFFh+Yl0PV64CQO8+1XovEP0rZUNoeq5/95GbyQj5bU1poFs5EsDEwLze+NXKQR4VxXXzonqZes7pQju4U3W7lttjBwe9IMbuEnFQgC6qXlz6E/CY5RJUHUvXyE4MvFCibRzXLsSnafMm3g5UmVr0rKNoyld4HAxGzBQg5rd1EQETMt0IFQ5YUkUXfDeL2Li0bxKD8hwcFkP130UxPyL+QpoHGAVhSJ8+/PjqCYUn0l2mVbMv7Dt6tLrcf5ACWyfuPjt5NFSUduZP8pWPvW2E2fkzSF2K75v3C1nwUb+NPYsx4SqkhSjw/G7AkS6vi976/dNgMz5dHQnKC1HO34FHiBTq2/v2sOle5pxvbvk8XPV3J2IVDUW07UzrSAdY2ltBttkgj/Vj1Qvp4CF9Ag3Bgd3A0jhgegwtXYcWQJl91+5cOyhV0zKmz2AbZ0VAdsSl/Sh+B1z517rMbXebxM9bvtWpGbLU/hnIbv5sCU6NnZLhK11o/pDzPqXdi2vAQmpYlkp+EFSfmNoCIexk9TsiTFhdIBBiyMZJisuKbWooZKrFtUYqxSCSjAyiqMj1lhh7Yxz3diRPOritEa4Et7WfwyHH3kxhwHkenz3DjbApvGPMJWZFAB+3/sP+th2vtG3ty7BhiDOWnXe3A==')
    
    try:
        # Validate prompt length
        if len(prompt) > 500:
            raise ValueError("Prompt is too long. Maximum allowed length is 500 characters.")
        
        # Generate images
        results = bing_art.generate_images(prompt)
        print(json.dumps(results))
    
    except Exception as e:
        print(json.dumps({"error": str(e)}))
    
    finally:
        bing_art.close_session()

if __name__ == "__main__":
    # Read prompt from stdin (for long input support)
    prompt = sys.stdin.read().strip() if not sys.argv[1:] else sys.argv[1]
    
    if not prompt:
        print(json.dumps({"error": "No prompt provided"}))
    else:
        generate_images(prompt)


    try:
        # Generate the image(s)
        results = bing_art.generate_images(prompt)
        
        # Output the results in JSON format
        print(json.dumps(results))

    except Exception as e:
        # Return the error as JSON
        print(json.dumps({"error": str(e)}))
    
    finally:
        # Ensure the session is closed even in case of an error
        bing_art.close_session()

if __name__ == "__main__":
    # Check if a prompt is provided
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No prompt provided"}))
    else:
        # Generate images using the provided prompt
        generate_images(sys.argv[1])
