import os
import re

# Define the project directory
project_dir = '/home/anchor/projects/u-pac/u-pac-hugo/scripts'  # Update this path to your project's root directory

# Patterns to identify phone number references
patterns = [
    re.compile(r'\bphone\b', re.IGNORECASE),
    re.compile(r'href=["\']tel:'),
    re.compile(r'\(\d{3}\)\s*\d{3}-\d{4}'),  # Matches (123) 456-7890
    re.compile(r'\d{3}-\d{3}-\d{4}'),        # Matches 123-456-7890
    re.compile(r'\d{10}'),                   # Matches 1234567890
]

# File extensions to scan
file_extensions = ['.html', '.js', '.json', '.toml', '.yaml', '.yml', '.md']

def scan_and_comment_out_phone_references():
    for subdir, _, files in os.walk(project_dir):
        for file in files:
            if any(file.endswith(ext) for ext in file_extensions):
                file_path = os.path.join(subdir, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                modified = False
                with open(file_path, 'w', encoding='utf-8') as f:
                    for line in lines:
                        if any(pattern.search(line) for pattern in patterns):
                            # Comment out the line
                            f.write(f'<!-- {line.strip()} -->\n' if file.endswith('.html') else f'// {line}')
                            modified = True
                        else:
                            f.write(line)
                
                if modified:
                    print(f'Modified: {file_path}')

if __name__ == '__main__':
    scan_and_comment_out_phone_references()
