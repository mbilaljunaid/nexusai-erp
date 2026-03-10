import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

a_tag_pattern = re.compile(r'(<a\b)([^>]*)(>)', re.IGNORECASE)

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content

    def tag_replacer(match):
        prefix = match.group(1)
        attrs = match.group(2)
        suffix = match.group(3)
        
        # Check if target="_blank"
        if re.search(r'\btarget\s*=\s*(?:\"_blank\"|\'_blank\'|\{\s*[\'\"]_blank[\'\"]\s*\})', attrs):
            # Check for existing rel
            rel_match = re.search(r'\brel\s*=\s*(?:\"([^\"]*)\"|\'([^\']*)\'|\{\s*[\'\"]([^}]*)[\'\"]\s*\})', attrs)
            
            needs_noopener = True
            needs_noreferrer = True
            
            if rel_match:
                rel_val = rel_match.group(1) or rel_match.group(2) or rel_match.group(3)
                if 'noopener' in rel_val: needs_noopener = False
                if 'noreferrer' in rel_val: needs_noreferrer = False
                
                if needs_noopener or needs_noreferrer:
                    # Append strictly to existing literal string
                    append_str = ""
                    if needs_noopener: append_str += " noopener"
                    if needs_noreferrer: append_str += " noreferrer"
                    
                    # Regex to inject inside the existing rel="..." value
                    # We'll just replace the original rel=... block entirely
                    new_rel_val = (rel_val + append_str).strip()
                    attrs = attrs[:rel_match.start()] + f'rel="{new_rel_val}"' + attrs[rel_match.end():]
            else:
                # No rel exists, inject one
                attrs = attrs + ' rel="noopener noreferrer"'
                
        return prefix + attrs + suffix

    content = a_tag_pattern.sub(tag_replacer, content)

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        files_modded += 1
        print(f"Secured links in {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        if 'node_modules' in root: continue
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                process_file(os.path.join(root, file))

print(f"Modifications made to {files_modded} files.")
