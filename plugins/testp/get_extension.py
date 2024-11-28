import os
import sys
import mimetypes

# Ensure a file path is passed
if len(sys.argv) < 2:
    print("❌ No file path provided.")
    sys.exit(1)

file_path = sys.argv[1]

# Print the path for debugging
print(f"Debug: Received file path: {file_path}")

# Check if file exists
if not os.path.exists(file_path):
    print("❌ File does not exist.")
    sys.exit(1)

# Get file extension from the MIME type
file_extension = os.path.splitext(file_path)[1]

# If there is no extension, try to identify it using MIME type
if not file_extension:
    print("❌ No extension found.")
    
    # Using mimetypes to get MIME type
    mime_type, encoding = mimetypes.guess_type(file_path)
    
    if mime_type:
        print(f"Debug: MIME Type: {mime_type}")
        
        # Guess the extension from the MIME type
        file_extension = mimetypes.guess_extension(mime_type)
        if file_extension:
            print(f"Debug: Extracted extension: {file_extension}")
        else:
            print("❌ Unknown MIME Type, cannot determine extension.")
            sys.exit(1)
    else:
        print("❌ Unable to determine MIME type.")
        sys.exit(1)

# Output the extension (this is what Node.js will capture)
print(file_extension)

# Optionally, delete the file after logging the extension (you can skip this part if unnecessary)
os.remove(file_path)
print(f"File deleted after logging.")
