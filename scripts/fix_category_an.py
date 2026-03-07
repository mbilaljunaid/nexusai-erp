import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

replacement_map = {
    "text-[10px]": "text-xs",
    "text-[11px]": "text-xs",
    "text-[12px]": "text-xs",
    "text-[13px]": "text-sm",
    "text-[14px]": "text-sm"
}

# Simple regex: find 'text-[10px]' etc. Ensure it's not preceded by word char.
# To be incredibly safe we just match the exact string since no typescript node contains "text-[10px]" legitimately outside quotes
pattern = re.compile(r'(?<![A-Za-z0-9\-])text-\[(?:10|11|12|13|14)px\]')

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = content
    made_changes = False

    def replacer(match):
        nonlocal made_changes
        made_changes = True
        return replacement_map[match.group(0)]

    new_content = pattern.sub(replacer, content)

    if made_changes:
        # cleanup duplicate classes
        new_content = new_content.replace('text-xs text-xs', 'text-xs')
        new_content = new_content.replace('text-sm text-sm', 'text-sm')
        new_content = re.sub(r'text-xs\s+text-xs', 'text-xs', new_content)
        new_content = re.sub(r'text-sm\s+text-sm', 'text-sm', new_content)

        with open(filepath, 'w') as f:
            f.write(new_content)
        files_modded += 1
        print(f"Fixed matching typography in: {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

print(f"Total files modded: {files_modded}")
