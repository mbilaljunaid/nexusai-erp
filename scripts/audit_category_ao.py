import os
import re

directories = ["src/pages", "src/components"]

lucide_import_pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"]')
# Regex to match the component tags, we'll build it dynamically
# but for now, let's just match any `<Component ... size={Num} ... />` where Component is from lucide.

total_instances = 0
files_with_instances = 0

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.tsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                # Find lucide imports
                lucide_icons = set()
                for match in lucide_import_pattern.finditer(content):
                    imports = match.group(1).split(',')
                    for imp in imports:
                        icon = imp.strip().split(' as ')[0].strip() # Handle aliases if any, though usually none
                        if icon:
                            lucide_icons.add(icon)
                
                if not lucide_icons:
                    continue
                
                # Now scan for those icons having size={...}
                # <IconName ... size={16} ... />
                instances_in_file = 0
                for icon in lucide_icons:
                    # Match <IconName followed by any attributes containing size={number}
                    # It might be multiline.
                    pattern = re.compile(r'<\s*' + re.escape(icon) + r'\b[^>]*\bsize=\{[0-9]+\}[^>]*>')
                    matches = pattern.findall(content)
                    instances_in_file += len(matches)
                
                if instances_in_file > 0:
                    files_with_instances += 1
                    total_instances += instances_in_file
                    print(f"{filepath}: {instances_in_file} instances")

print(f"Total Lucide icons with size={{...}}: {total_instances} across {files_with_instances} files")
