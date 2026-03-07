import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

TAG_MAP = {
    '<table': '<Table', '</table': '</Table',
    '<thead': '<TableHeader', '</thead': '</TableHeader',
    '<tbody': '<TableBody', '</tbody': '</TableBody',
    '<tr': '<TableRow', '</tr': '</TableRow',
    '<th': '<TableHead', '</th': '</TableHead',
    '<td': '<TableCell', '</td': '</TableCell'
}

def clean_table_className(match):
    # Specialized cleaner to strip generic w-full border-collapse artifacts 
    # since Shadcn <Table> handles that natively in its generic wrapper.
    class_str = match.group(1)
    class_str = class_str.replace('w-full', '').replace('border-collapse', '').replace('min-w-full', '')
    class_str = re.sub(r'\s+', ' ', class_str).strip()
    if not class_str: return ''
    return f'className="{class_str}"'

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content

    # Only modify files that actually contain an old <table
    if '<table' not in content:
        return

    # Map closing tags globally (safe to do via regex for these specific names)
    content = re.sub(r'</table>', '</Table>', content, flags=re.IGNORECASE)
    content = re.sub(r'</thead>', '</TableHeader>', content, flags=re.IGNORECASE)
    content = re.sub(r'</tbody>', '</TableBody>', content, flags=re.IGNORECASE)
    content = re.sub(r'</tr>', '</TableRow>', content, flags=re.IGNORECASE)
    content = re.sub(r'</th>', '</TableHead>', content, flags=re.IGNORECASE)
    content = re.sub(r'</td>', '</TableCell>', content, flags=re.IGNORECASE)
    
    # Map opening tags that have boundaries
    content = re.sub(r'<table\b', '<Table', content, flags=re.IGNORECASE)
    content = re.sub(r'<thead\b', '<TableHeader', content, flags=re.IGNORECASE)
    content = re.sub(r'<tbody\b', '<TableBody', content, flags=re.IGNORECASE)
    content = re.sub(r'<tr\b', '<TableRow', content, flags=re.IGNORECASE)
    content = re.sub(r'<th\b', '<TableHead', content, flags=re.IGNORECASE)
    content = re.sub(r'<td\b', '<TableCell', content, flags=re.IGNORECASE)

    # Clean <Table ... className="w-full border-collapse"> specific remnants
    # Apply dynamically after the tag rename
    def table_replacer(match):
        prefix = match.group(1)
        attrs = match.group(2)
        suffix = match.group(3)
        attrs = re.sub(r'className="([^"]*)"', clean_table_className, attrs)
        attrs = attrs.replace('className=""', '')
        return prefix + attrs + suffix

    content = re.sub(r'(<Table\b)([^>]*)(>)', table_replacer, content, flags=re.IGNORECASE)

    if content != orig:
        # Inject standard Shadcn imports if required
        import_stmt = 'import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";'
        if 'import { Table,' not in content and 'import { Table }' not in content:
            imports = list(re.finditer(r'^import .*?;?$', content, re.MULTILINE))
            if imports:
                last_import = imports[-1]
                content = content[:last_import.end()] + f'\n{import_stmt}' + content[last_import.end():]
            else:
                content = f'{import_stmt}\n{content}'

        with open(filepath, 'w') as f:
            f.write(content)
        files_modded += 1
        print(f"Modded tables in {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        if 'node_modules' in root: continue
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                process_file(os.path.join(root, file))

print(f"Modifications made to {files_modded} files.")
