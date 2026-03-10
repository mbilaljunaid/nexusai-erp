import os
import re

directories = ["src/pages", "src/components"]

# Match <a> tags
a_tag_pattern = re.compile(r'<a\b([^>]*)>', re.IGNORECASE)

total_instances = 0
files_with_instances = 0

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                instances_in_file = 0
                for match in a_tag_pattern.finditer(content):
                    attrs = match.group(1)
                    # Check if target="_blank" (or target={'_blank'})
                    if re.search(r'\btarget\s*=\s*(?:\"_blank\"|\'_blank\'|\{\s*[\'\"]_blank[\'\"]\s*\})', attrs):
                        # Check if rel contains noopener and noreferrer
                        rel_match = re.search(r'\brel\s*=\s*(?:\"([^\"]*)\"|\'([^\']*)\'|\{\s*[\'\"](.*?)[\'\"]\s*\})', attrs)
                        if rel_match:
                            rel_val = rel_match.group(1) or rel_match.group(2) or rel_match.group(3)
                            if 'noopener' not in rel_val or 'noreferrer' not in rel_val:
                                instances_in_file += 1
                        else:
                            instances_in_file += 1
                
                if instances_in_file > 0:
                    files_with_instances += 1
                    total_instances += instances_in_file
                    print(f"{filepath}: {instances_in_file} instances")

print(f"Total <a target='_blank'> missing rel='noopener noreferrer': {total_instances} across {files_with_instances} files")
