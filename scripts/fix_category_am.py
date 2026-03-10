import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

# We need a robust regex to just find the opening tags of the div we care about.
# flex and justify-end or ml-auto inside className="..."
open_tag_pattern = re.compile(r'<div\s+className="[^"]*(?:flex\s+justify-end|justify-end\s+flex|justify-end\s+gap|space-x-\d+\s+justify-end|ml-auto\s+flex|flex\s+ml-auto|justify-end)[^"]*"[^>]*>')

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    is_dialog = 'DialogContent' in content or 'DialogHeader' in content
    is_sheet = 'SheetContent' in content or 'SheetHeader' in content
    if not is_dialog and not is_sheet:
        return

    target_footer = "DialogFooter" if is_dialog else "SheetFooter"
    import_target = "dialog" if target_footer == "DialogFooter" else "sheet"

    new_content = content
    made_changes = False

    # Find all matches (reverse order so indices don't shift when we replace)
    matches = list(open_tag_pattern.finditer(content))
    matches.reverse()

    for match in matches:
        start_idx = match.start()
        after_open_tag = match.end()
        
        # Now find the matching closing </div>
        depth = 1
        pos = after_open_tag
        found_close = False
        end_idx = pos
        
        while pos < len(content):
            # Check for <div and </div>
            if content.startswith('<div', pos):
                depth += 1
                pos += 4
            elif content.startswith('</div', pos):
                depth -= 1
                if depth == 0:
                    found_close = True
                    # Find the > of the closing tag
                    close_tag_end = content.find('>', pos)
                    end_idx = close_tag_end + 1
                    break
                pos += 5
            else:
                pos += 1
                
        if found_close:
            block = content[start_idx:end_idx]
            # Must not be a giant block (e.g. wrapping the whole page)
            # Standard footers are small. Check button count.
            if ('<Button' in block or '<button' in block) and block.count('<div') < 3 and len(block) < 2000:
                made_changes = True
                inner = content[after_open_tag:pos]
                replacement = f"<{target_footer}>{inner}</{target_footer}>"
                
                # Replace that specific block
                new_content = new_content[:start_idx] + replacement + new_content[end_idx:]

    if made_changes:
        if f'import {{ {target_footer}' not in new_content and f'import {{{target_footer}' not in new_content:
            import_pattern = re.compile(rf'import\s+{{([^}}]*)}}\s+from\s+"@/components/ui/({import_target})"|import\s+{{([^}}]*)}}\s+from\s+"@/components/ui"')
            
            def import_replacer(m):
                imports = m.group(1) or m.group(3)
                target = m.group(2) or import_target
                return f'import {{{imports}, {target_footer}}} from "@/components/ui/{target}"'
                
            if import_pattern.search(new_content):
                new_content = import_pattern.sub(import_replacer, new_content)
            else:
                new_content = f'import {{ {target_footer} }} from "@/components/ui/{import_target}";\n' + new_content

        with open(filepath, 'w') as f:
            f.write(new_content)
            
        files_modded += 1
        print(f"Fixed: {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        if 'components/ui' in root: continue
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

print(f"Total files modded: {files_modded}")
