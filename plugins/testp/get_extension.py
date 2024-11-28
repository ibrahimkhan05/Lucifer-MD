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

# Get file extension
file_extension = os.path.splitext(file_path)[1]

# If there is no extension, try to identify it (simple fallback mechanism)
if not file_extension:
    print("❌ No extension found.")
    
    # Try to guess extension using file signature (magic bytes)
    try:
        import magic
        mime_type = magic.Magic(mime=True).from_file(file_path)
        print(f"Debug: MIME Type: {mime_type}")
        
        # Try to guess the file extension from MIME type
        file_extension = mimetypes.guess_extension(mime_type)
        if file_extension:
            print(f"Debug: Extracted extension: {file_extension}")
        else:
            print("❌ Unable to determine extension from MIME type.")
            sys.exit(1)
    
    except ImportError:
        print("❌ Unable to import python-magic to determine file type.")
        sys.exit(1)

# Print the extension for debugging
print(f"Debug: Extracted extension: {file_extension}")

# Output the extension (this is what Node.js will capture)
print(file_extension)

# Optionally, you can save the file with its extension
new_file_name = file_path + file_extension
os.rename(file_path, new_file_name)

# Print the new file name with extension
print(f"File saved as: {new_file_name}")

# Optionally, delete the file after logging the extension (if necessary)
os.remove(new_file_name)
print(f"File deleted after logging.")
