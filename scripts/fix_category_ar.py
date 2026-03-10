import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

def extract_tags(content, tag_name):
    results = []
    idx = 0
    while True:
        start = content.find(f'<{tag_name}', idx)
        if start == -1:
            break
        
        next_char = content[start + len(tag_name) + 1 : start + len(tag_name) + 2]
        if next_char not in ('', ' ', '\n', '\t', '>', '/'):
            idx = start + 1
            continue
        
        i = start + len(tag_name) + 1
        brace_depth = 0
        in_string = False
        string_char = ''
        
        while i < len(content):
            c = content[i]
            if not in_string:
                if c in ('"', "'", "`"):
                    in_string = True
                    string_char = c
                elif c == '{':
                    brace_depth += 1
                elif c == '}':
                    brace_depth -= 1
                elif c == '>' and brace_depth == 0:
                    results.append((start, i, content[start+len(tag_name)+1:i]))
                    idx = i + 1
                    break
            else:
                if c == string_char and content[i-1] != '\\':
                    in_string = False
            i += 1
        else:
            idx = start + 1
            
    return results

def clean_style(match):
    style_body = match.group(1)
    keys_to_remove = ['padding', 'background', 'backgroundColor', 'color', 'border', 'borderRadius', 'fontSize', 'fontWeight', 'cursor']
    for k in keys_to_remove:
        pattern = r'\b' + k + r'\s*:\s*(?:[\'"`][^\'"`]*[\'"`]|[\d\.]+|[a-zA-Z_]+)\s*,?\s*'
        style_body = re.sub(pattern, '', style_body)
    new_style = style_body.strip()
    if not new_style:
        return ''
    # Clean up trailing comma
    if new_style.endswith(','): new_style = new_style[:-1]
    return 'style={{' + new_style.strip() + '}}'

def clean_className(match):
    class_str = match.group(1)
    patterns_to_remove = [
        r'\bbg-[a-zA-Z0-9\[\]\-#]+\b',
        r'\btext-[white|black|transparent|[a-zA-Z0-9\[\]\-#]]+\b',
        r'\bborder-[a-zA-Z0-9\[\]\-#]+\b',
        r'\brounded-[a-zA-Z0-9\[\]\-]+\b',
        r'\bfont-[a-zA-Z0-9\[\]\-]+\b',
        r'\bcursor-[a-zA-Z0-9\[\]\-]+\b',
        r'\bp[xytrbl]?-[a-zA-Z0-9\[\]\-\.]+\b'
    ]
    for p in patterns_to_remove:
        class_str = re.sub(p, '', class_str)
    class_str = re.sub(r'\s+', ' ', class_str).strip()
    if not class_str:
        return ''
    return f'className="{class_str}"'

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content
    
    # Process </button> to </Button>
    content = re.sub(r'</button>', '</Button>', content, count=0, flags=re.IGNORECASE)
    
    # Extract all <button ... > tags
    # Start from back to front so indices don't shift!
    tags = extract_tags(content, 'button')
    tags.reverse()
    
    for start, end, attrs_orig in tags:
        variant = "default"
        size = "default"
        
        # Deduct variant
        lower_attrs = attrs_orig.lower()
        if 'fee2e2' in lower_attrs or 'dc2626' in lower_attrs or 'bg-red' in lower_attrs or 'bg-rose' in lower_attrs or 'destructive' in lower_attrs:
            variant = "destructive"
        elif 'transparent' in lower_attrs and 'border' not in lower_attrs:
            variant = "ghost"
        elif 'ghost' in lower_attrs:
            variant = "ghost"
        elif 'outline' in lower_attrs or ('border' in lower_attrs and 'transparent' in lower_attrs):
            variant = "outline"
        elif 'f3f4f6' in lower_attrs or 'bg-gray' in lower_attrs or 'secondary' in lower_attrs or '111827' in lower_attrs:
            variant = "secondary"
        
        # Deduct size
        if 'text-[10px]' in lower_attrs or 'text-[11px]' in lower_attrs or 'text-xs' in lower_attrs or 'px-2' in lower_attrs or 'px-3' in lower_attrs or 'py-1' in lower_attrs or 'fontsize: 10' in lower_attrs or 'fontsize: 11' in lower_attrs or 'fontsize: 12' in lower_attrs or 'padding: \'4px' in lower_attrs or 'padding: \'5px' in lower_attrs or 'padding: \'6px' in lower_attrs:
            size = "sm"
            
        # Clean up inline styles and classes
        attrs_clean = re.sub(r'style=\{\{(.*?)\}\}', clean_style, attrs_orig, flags=re.DOTALL)
        attrs_clean = re.sub(r'className="([^"]*)"', clean_className, attrs_clean, flags=re.DOTALL)
        
        # Remove empty style/className remnants that might have been left if entirely stripped
        attrs_clean = attrs_clean.replace('style={{}}', '').replace('className=""', '')
        
        # Build new tag
        new_tag = f'<Button variant="{variant}"'
        if size != "default":
            new_tag += f' size="{size}"'
        new_tag += attrs_clean + '>'
        
        content = content[:start] + new_tag + content[end+1:]

    # Inject import if modified
    if content != orig:
        if 'import { Button }' not in content and 'import { Button}' not in content:
            imports = list(re.finditer(r'^import .*?;?$', content, re.MULTILINE))
            if imports:
                last_import = imports[-1]
                content = content[:last_import.end()] + '\nimport { Button } from "@/components/ui/button";' + content[last_import.end():]
            else:
                content = 'import { Button } from "@/components/ui/button";\n' + content

        with open(filepath, 'w') as f:
            f.write(content)
        files_modded += 1
        print(f"Modded buttons in {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        if 'node_modules' in root: continue
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                process_file(os.path.join(root, file))

print(f"Modifications made to {files_modded} files.")
