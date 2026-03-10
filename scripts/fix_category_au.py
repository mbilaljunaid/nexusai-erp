import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

def extract_bracketed(string, start_idx):
    """Safely extracts a section from { to matching }"""
    if string[start_idx] != '{':
        return None, start_idx
    balance = 0
    in_quote = False
    quote_char = ''
    for i in range(start_idx, len(string)):
        c = string[i]
        if in_quote:
            if c == quote_char and string[i-1] != '\\':
                in_quote = False
        elif c in '"\'`':
            in_quote = True
            quote_char = c
        elif c == '{':
            balance += 1
        elif c == '}':
            balance -= 1
            if balance == 0:
                return string[start_idx:i+1], i+1
    return None, start_idx

def find_open_tag_end(content, start_idx):
    in_quote = False
    quote_char = ''
    brace_depth = 0
    for i in range(start_idx, len(content)):
        c = content[i]
        if in_quote:
            if c == quote_char and content[i-1] != '\\':
                in_quote = False
        elif c in '"\'`':
            in_quote = True
            quote_char = c
        elif c == '{':
            brace_depth += 1
        elif c == '}':
            brace_depth -= 1
        elif c == '>' and brace_depth == 0 and not in_quote:
            return i
    return -1

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content

    has_role_button = 'role="button"' in content
    has_import = re.search(r'import\s+{([^}]*)}\s*from\s+["\']@/components/ui/button["\']', content)

    if has_role_button and not has_import:
        import_stmt = 'import { Button } from "@/components/ui/button";\n'
        content = re.sub(r'^(import.*?)\n\n', r'\1\n' + import_stmt + '\n', content, count=1, flags=re.MULTILINE|re.DOTALL)
        if content == orig:
            content = import_stmt + content
    elif has_role_button and has_import:
        imported_items = has_import.group(1)
        if 'Button' not in imported_items:
            content = re.sub(r'(import\s+{)([^}]*)(}\s*from\s+["\']@/components/ui/button["\'])', r'\1 Button, \2\3', content)

    ptr = 0
    while ptr < len(content):
        role_idx = content.find('role="button"', ptr)
        if role_idx == -1:
            break
            
        open_idx = content.rfind('<', 0, role_idx)
        if open_idx == -1:
            ptr = role_idx + 1
            continue
            
        tag_match = re.match(r'<([a-zA-Z0-9_.-]+)[\s>]', content[open_idx:])
        if not tag_match:
            ptr = role_idx + 1
            continue
            
        tag_name = tag_match.group(1)
        
        if tag_name.lower() in ['button', 'a', 'link']:
            ptr = role_idx + 1
            continue

        end_open_idx = find_open_tag_end(content, open_idx)
        if end_open_idx == -1:
            ptr = role_idx + 1
            continue
            
        open_tag_str = content[open_idx:end_open_idx+1]
        
        clean_open = open_tag_str.replace('role="button"', ' ')
        clean_open = re.sub(r'tabIndex=\{[\d"A-Za-z-]+\}', ' ', clean_open)
        clean_open = clean_open.replace('tabIndex="0"', ' ')
        
        # Safely remove onKeyDown entirely via custom extracted block
        while 'onKeyDown={' in clean_open:
            kd_start = clean_open.find('onKeyDown={')
            val_start = kd_start + len('onKeyDown=')
            val_str, val_end = extract_bracketed(clean_open, val_start)
            if val_str:
                clean_open = clean_open[:kd_start] + ' ' + clean_open[val_end:]
            else:
                 break

        onclick_str = ""
        while 'onClick={' in clean_open:
            oc_start = clean_open.find('onClick={')
            val_start = oc_start + len('onClick=')
            val_str, val_end = extract_bracketed(clean_open, val_start)
            if val_str:
                onclick_str = f'onClick={val_str}'
                clean_open = clean_open[:oc_start] + ' ' + clean_open[val_end:]
            else:
                 break
        
        clean_open = re.sub(r'\s+', ' ', clean_open).replace(' >', '>').replace(' />', '/>')

        extra_btn_classes = " w-full h-auto p-0 font-normal "
        if tag_name == "Card" or tag_name == "Badge":
             extra_btn_classes += " overflow-hidden border-none shadow-none bg-transparent "
             
        # Add wrapper
        wrapper_open = f'<Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left {extra_btn_classes}" {onclick_str} asChild>'

        if content[end_open_idx-1] == '/':
            wrapped = f"{wrapper_open}\n{clean_open}\n</Button>"
            content = content[:open_idx] + wrapped + content[end_open_idx+1:]
            ptr = open_idx + len(wrapped)
            continue
            
        balance = 1
        curr_idx = end_open_idx + 1
        close_tag_pattern = f'</{tag_name}>'
        open_tag_pattern = f'<{tag_name}'
        
        found_close = -1
        while curr_idx < len(content):
            # Skip searching inside string literals or JSX brackets to be completely safe?
            # It's usually fine unless a string literal literally contains `</div>`.
            next_close = content.find(close_tag_pattern, curr_idx)
            next_open = content.find(open_tag_pattern, curr_idx)
            
            if next_close == -1:
                break
                
            if next_open != -1 and next_open < next_close:
                 if content[next_open:next_open+len(tag_name)+1] in [f'<{tag_name} ', f'<{tag_name}>', f'<{tag_name}/', f'<{tag_name}\n']:
                     balance += 1
                 curr_idx = next_open + len(tag_name)
            else:
                 balance -= 1
                 curr_idx = next_close + len(tag_name) + 3
                 if balance == 0:
                     found_close = next_close
                     break
                     
        if found_close != -1:
            inner_str = content[end_open_idx+1:found_close]
            close_tag_str = content[found_close:found_close+len(close_tag_pattern)]
            
            wrapped = f"{wrapper_open}\n{clean_open}{inner_str}{close_tag_str}\n</Button>"
            content = content[:open_idx] + wrapped + content[found_close+len(close_tag_pattern):]
            ptr = open_idx + len(wrapped)
        else:
            ptr = role_idx + 1

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        files_modded += 1
        print(f"Modded semantic interactives in {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        if 'node_modules' in root: continue
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                process_file(os.path.join(root, file))

print(f"Modifications made to {files_modded} files.")
