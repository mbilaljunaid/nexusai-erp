import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

size_map = {
    10: "h-2.5 w-2.5",
    12: "h-3 w-3",
    14: "h-3.5 w-3.5",
    16: "h-4 w-4",
    20: "h-5 w-5",
    24: "h-6 w-6",
    32: "h-8 w-8",
    40: "h-10 w-10",
    48: "h-12 w-12"
}

def get_tailwind_size(size_val):
    try:
        val = int(size_val)
        if val in size_map:
            return size_map[val]
        return f"h-[{val}px] w-[{val}px]"
    except ValueError:
        return f"h-[{size_val}px] w-[{size_val}px]"

lucide_import_pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"]')

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    lucide_icons = set()
    for match in lucide_import_pattern.finditer(content):
        imports = match.group(1).split(',')
        for imp in imports:
            icon = imp.strip().split(' as ')[0].strip()
            if icon:
                lucide_icons.add(icon)
                
    if not lucide_icons:
        return

    orig = content

    for icon in lucide_icons:
        # Regex to find the whole tag: <IconName ... >
        tag_pattern = re.compile(r'(<\s*' + re.escape(icon) + r'\b)([^>]*)(>)')
        
        def tag_replacer(match):
            prefix = match.group(1)
            attrs = match.group(2)
            suffix = match.group(3)
            
            # Find size={XX} or size="XX" in attrs
            size_match = re.search(r'\bsize\s*=\s*(?:\{([0-9]+)\}|"([0-9]+)")', attrs)
            if not size_match:
                return match.group(0)
                
            size_val = size_match.group(1) or size_match.group(2)
            tw_class = get_tailwind_size(size_val)
            
            # Remove size attr
            attrs = attrs[:size_match.start()] + attrs[size_match.end():]
            
            # Inject into className
            class_literal = re.search(r'\bclassName\s*=\s*"([^"]*)"', attrs)
            class_expr = re.search(r'\bclassName\s*=\s*\{([^}]*)\}', attrs)
            
            if class_literal:
                existing = class_literal.group(1).strip()
                new_class = f'{existing} {tw_class}' if existing else tw_class
                attrs = attrs[:class_literal.start()] + f'className="{new_class}"' + attrs[class_literal.end():]
            elif class_expr:
                expr_body = class_expr.group(1).strip()
                if expr_body.startswith("cn("):
                    new_expr_body = f'cn("{tw_class}", ' + expr_body[3:]
                    attrs = attrs[:class_expr.start()] + f'className={{{new_expr_body}}}' + attrs[class_expr.end():]
                else:
                    new_expr_body = f'`{tw_class} ${{ {expr_body} }}`'
                    attrs = attrs[:class_expr.start()] + f'className={{{new_expr_body}}}' + attrs[class_expr.end():]
            else:
                # No className yet
                attrs = f' className="{tw_class}"' + attrs
                
            return prefix + attrs + suffix

        content = tag_pattern.sub(tag_replacer, content)

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        files_modded += 1
        print(f"Fixed {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                process_file(os.path.join(root, file))

print(f"Modified {files_modded} files.")
