import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

# Find <label ...> and </label>
label_open_pattern = re.compile(r'<label\b([^>]*)>')
label_close_pattern = re.compile(r'</label>')

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    # Skip files that don't have <label
    if '<label' not in content and '</label>' not in content:
        return

    made_changes = False

    def replacer(match):
        nonlocal made_changes
        made_changes = True
        attrs = match.group(1)
        
        # Replace 'for=' with 'htmlFor=' if it exists
        attrs = re.sub(r'\bfor=', 'htmlFor=', attrs)
        
        return f'<Label{attrs}>'

    new_content = label_open_pattern.sub(replacer, content)
    
    if made_changes or '</label>' in new_content:
        made_changes = True
        new_content = label_close_pattern.sub('</Label>', new_content)

    if made_changes:
        # Check if import is needed
        if 'from "@/components/ui/label"' not in new_content and 'from "@components/ui/label"' not in new_content:
            # Inject import after the last import statement
            imports = list(re.finditer(r'^import .*?;$', new_content, re.MULTILINE))
            if imports:
                last_import = imports[-1]
                insert_pos = last_import.end()
                new_content = new_content[:insert_pos] + '\nimport { Label } from "@/components/ui/label";' + new_content[insert_pos:]
            else:
                new_content = 'import { Label } from "@/components/ui/label";\n' + new_content

        with open(filepath, 'w') as f:
            f.write(new_content)
        files_modded += 1
        print(f"Fixed labels in: {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        if 'components/ui' in root: continue
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

print(f"Total files modded: {files_modded}")
