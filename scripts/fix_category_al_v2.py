import os
import re
import string

directories = ["src/pages", "src/components"]
files_modded = 0

# Match variations of: `variable.toLocaleString(...)` or `(math_expr).toLocaleString(...)`
pattern = re.compile(r'([a-zA-Z0-9_\.\[\]\?]+(?:\([^)]*\))?)\.toLocaleString\(([^)]*)\)')

def replacer(match):
    obj = match.group(1)
    args = match.group(2)
    args_str = args.replace(" ", "").replace("\n", "")
    
    if "currency" in args_str and "USD" in args_str:
        return f"formatCurrency({obj})"
    elif "percent" in args_str:
        return f"formatPercent({obj})"
    else:
        # e.g., undefined, { minimumFractionDigits: 2 }
        if "," in args:
            digits = [c for c in args if c in string.digits]
            if digits:
                return f"formatNumber({obj}, {digits[-1]})"
        return f"formatNumber({obj})"

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()
    
    if '.toLocaleString' not in content:
        return
        
    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        imports_needed = []
        if 'formatNumber' in new_content and 'formatNumber' not in content: imports_needed.append('formatNumber')
        if 'formatCurrency' in new_content and 'formatCurrency' not in content: imports_needed.append('formatCurrency')
        if 'formatPercent' in new_content and 'formatPercent' not in content: imports_needed.append('formatPercent')
        
        if imports_needed:
            import_stmt = f"import {{ {', '.join(imports_needed)} }} from '@/lib/formatters';"
            imports = list(re.finditer(r'^import .*?;$', new_content, re.MULTILINE))
            if imports:
                insert_pos = imports[-1].end()
                new_content = new_content[:insert_pos] + '\n' + import_stmt + new_content[insert_pos:]
            else:
                new_content = import_stmt + '\n' + new_content
                
        with open(filepath, 'w') as f:
            f.write(new_content)
        files_modded += 1
        print(f"Fixed locales in: {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                process_file(os.path.join(root, file))

print(f"Total files modded: {files_modded}")
