import os
import sys
import mimetypes

# Ensure a file path is passed
if len(sys.argv) < 2:
    sys.exit(1)

file_path = sys.argv[1]

# Check if file exists
if not os.path.exists(file_path):
    sys.exit(1)

# Get file extension
file_extension = os.path.splitext(file_path)[1]

# If there is no extension, try to identify it (simple fallback mechanism)
if not file_extension:
    # Try to guess extension using file signature (magic bytes)
    try:
        import magic
        mime_type = magic.Magic(mime=True).from_file(file_path)
        
        # Try to guess the file extension from MIME type
        file_extension = mimetypes.guess_extension(mime_type)
        if not file_extension:
            sys.exit(1)
    
    except ImportError:
        sys.exit(1)

# Output the extension (this is what Node.js will capture)
print(file_extension)
