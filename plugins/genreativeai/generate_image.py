import json
import sys
from bingart import BingArt

def generate_images(prompt):
    # Initialize BingArt with authentication cookies
    bing_art = BingArt(
        auth_cookie_U="1U_58_pIZdKxcTVuo1APZCwE47ZKduzgtshUloH1hCW5QhRLoptz1v3W0khma17G6dMagB8UsJ3YK7AlIYJ3ctxVEqn-0Bpk1uy1H3tnh6QtatrJYMpVvp2VNlSBaQWmk0CCIkF65BGcxmoKoCaONZqxwCSjVIvlwL0ei3rAYWg2SWc9P4L3rLjWvdc9zpB0Kx2TLLLDZ8p_id1t2d77FfG5a0vI_7cLEGJjj49zKBjM",
        auth_cookie_KievRPSSecAuth="FACKBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACNFgPqIOv4tXSASMJ1vcq1ZQ1eDCxE8T5fq5jrERaCsJqmdE8KHh36ZpehcQBYusXpG8glokBbPCE6+SxlxPwUqaI93x3pfOcs4on72WG+E/G2TNSdqe4B9gopIz8uTe6T3h6n2yp4jlv+aucm8lJEQn2sMrFHbkF08F34qEFHNWiQey4Volc8ItcKErx6703UanLbwMlqQAmorstppgCVFsdKzWhvCWxsB1uAC+IRo8D2ZqjTVV8xuCe78tIJNwzmfgPB5n9LvpD3/7kYcgM9AF9yCPlHrr0XcnQHpHd0JLThfVnZ7in4xqS7kcZtrvd18HJUfVxNOjnBXGESJcPToP4ZyvMnWhTEB3bGBPEK/4SYd+pRd79sjzs1vtSC1LBDH4vMmXqG+K3i0TAvFibqM9/SV2hyZ7YG/EeeAdIePs2JLjHFQYJyTl2Jr9CLyKDzosWbt1+KGolDBprUHWb9KlR/BfYDKfEU2Eoc1y8hmzZC4BNHw+DmpeuHgangdhG33ySklE7POwZ1sXFBRiXYrtpUye6eF9oZkKJUWBQOefukXIKiOx+kwsHsYgTMSIJPOaauSVLevSTs37c8c4S6YwsPPrgwT86iWZB1FX+5IFHy2Nud4aIzv+/NGAGfQWK5fqD/QYWNJCwIlHhLwyoAwQDAs5BziYQfR5GG2qPZ+yyW4R2yDS0MP9Fvf2I2LjVPs/acz8onxrg3zvPQCNfAzSnlHvqKC5BllLp8bQ88dsl3yl4jWbz/CqmoTphvoxMmxkPi0VKhKu9Qeft99rs5yxDzvvkUXTWsuh7IpElhlTN4wcRxJL8y2cs0Z1lz8/GsQ5wfJ7rrSPZcJQWrnuYFFh+Yl0PV64CQO8+1XovEP0rZUNoeq5/95GbyQj5bU1poFs5EsDEwLze+NXKQR4VxXXzonqZes7pQju4U3W7lttjBwe9IMbuEnFQgC6qXlz6E/CY5RJUHUvXyE4MvFCibRzXLsSnafMm3g5UmVr0rKNoyld4HAxGzBQg5rd1EQETMt0IFQ5YUkUXfDeL2Li0bxKD8hwcFkP130UxPyL+QpoHGAVhSJ8+/PjqCYUn0l2mVbMv7Dt6tLrcf5ACWyfuPjt5NFSUduZP8pWPvW2E2fkzSF2K75v3C1nwUb+NPYsx4SqkhSjw/G7AkS6vi976/dNgMz5dHQnKC1HO34FHiBTq2/v2sOle5pxvbvk8XPV3J2IVDUW07UzrSAdY2ltBttkgj/Vj1Qvp4CF9Ag3Bgd3A0jhgegwtXYcWQJl91+5cOyhV0zKmz2AbZ0VAdsSl/Sh+B1z517rMbXebxM9bvtWpGbLU/hnIbv5sCU6NnZLhK11o/pDzPqXdi2vAQmpYlkp+EFSfmNoCIexk9TsiTFhdIBBiyMZJisuKbWooZKrFtUYqxSCSjAyiqMj1lhh7Yxz3diRPOritEa4Et7WfwyHH3kxhwHkenz3DjbApvGPMJWZFAB+3/sP+th2vtG3ty7BhiDOWnXe3A=="
    )

    try:
        # Generate images
        results = bing_art.generate_images(prompt)
        
        # Output results in JSON format
        print(json.dumps(results))

    except Exception as e:
        # Return error in JSON format
        print(json.dumps({"error": str(e)}))

    finally:
        # Ensure session is closed even in case of an error
        bing_art.close_session()

if __name__ == "__main__":
    # Join arguments safely to handle long prompts
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No prompt provided"}))
    else:
        prompt = " ".join(sys.argv[1:])  # Join all arguments into a single prompt
        generate_images(prompt)
