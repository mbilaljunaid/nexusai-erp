import os
import re

directories = ["src/pages", "src/components"]
files_modded = 0

# Static CSS to Tailwind map
STYLE_MAP = {
    r"display:\s*['\"]flex['\"]": "flex",
    r"display:\s*['\"]grid['\"]": "grid",
    r"flexDirection:\s*['\"]column['\"]": "flex-col",
    r"flexDirection:\s*['\"]row['\"]": "flex-row",
    r"justifyContent:\s*['\"]space-between['\"]": "justify-between",
    r"justifyContent:\s*['\"]center['\"]": "justify-center",
    r"justifyContent:\s*['\"]flex-end['\"]": "justify-end",
    r"alignItems:\s*['\"]center['\"]": "items-center",
    r"alignItems:\s*['\"]flex-start['\"]": "items-start",
    r"alignItems:\s*['\"]flex-end['\"]": "items-end",
    r"fontWeight:\s*700": "font-bold",
    r"fontWeight:\s*['\"]700['\"]": "font-bold",
    r"fontWeight:\s*600": "font-semibold",
    r"fontWeight:\s*800": "font-extrabold",
    r"fontWeight:\s*500": "font-medium",
    r"fontFamily:\s*['\"]monospace['\"]": "font-mono",
    r"textAlign:\s*['\"]center['\"]": "text-center",
    r"textAlign:\s*['\"]right['\"]": "text-right",
    r"textAlign:\s*['\"]left['\"]": "text-left",
    r"cursor:\s*['\"]pointer['\"]": "cursor-pointer",
    r"overflowX:\s*['\"]auto['\"]": "overflow-x-auto",
    r"overflow:\s*['\"]hidden['\"]": "overflow-hidden",
    # Specific Hex visual overrides breaking Dark schema
    r"background:\s*['\"]#fff['\"]": "bg-card",
    r"background:\s*['\"]#ffffff['\"]": "bg-card",
    r"backgroundColor:\s*['\"]#fff['\"]": "bg-card",
    r"color:\s*['\"]#6b7280['\"]": "text-muted-foreground",
    r"color:\s*['\"]#9ca3af['\"]": "text-muted-foreground",
    r"color:\s*['\"]#374151['\"]": "text-foreground",
    r"color:\s*['\"]#111827['\"]": "text-foreground",
}

def convert_px_to_rem(px_val):
    if px_val == 0: return "0"
    if px_val == 4: return "1"
    if px_val == 8: return "2"
    if px_val == 12: return "3"
    if px_val == 16: return "4"
    if px_val == 20: return "5"
    if px_val == 24: return "6"
    if px_val == 32: return "8"
    return f"[{px_val}px]"

def map_style_block(style_str):
    classes = []
    residual_styles = []

    # Safe split by comma, ignoring commas inside nested quotes/parens
    parts = re.split(r',(?=(?:[^"]*"[^"]*")*[^"]*$)(?=(?:[^\']*\'[^\']*\')*[^\']*$)', style_str)
    
    for part in parts:
        part = part.strip()
        if not part: continue
        matched = False

        # 1. Exact direct matches based on regex rules mapping
        for regex, tw_class in STYLE_MAP.items():
            if re.search(regex, part):
                classes.append(tw_class)
                matched = True
                break
        
        if matched: continue

        # 2. Dynamic numeric parsing routines (fontSize, padding, margin, etc.) 
        # fontSize: 13 -> text-[13px]
        m = re.match(r"fontSize:\s*(\d+)", part)
        if m:
            classes.append(f"text-[{m.group(1)}px]")
            continue
            
        m = re.match(r"marginTop:\s*(\d+)", part)
        if m:
            classes.append(f"mt-{convert_px_to_rem(int(m.group(1)))}")
            continue
            
        m = re.match(r"marginBottom:\s*(\d+)", part)
        if m:
            classes.append(f"mb-{convert_px_to_rem(int(m.group(1)))}")
            continue

        m = re.match(r"marginLeft:\s*(\d+)", part)
        if m:
            classes.append(f"ml-{convert_px_to_rem(int(m.group(1)))}")
            continue
            
        m = re.match(r"gap:\s*(\d+)", part)
        if m:
            classes.append(f"gap-{convert_px_to_rem(int(m.group(1)))}")
            continue

        m = re.match(r"borderRadius:\s*(\d+)", part)
        if m:
            classes.append(f"rounded-{convert_px_to_rem(int(m.group(1)))}")
            continue
            
        # Parse shorthand padding: '10px 14px' -> px-[14px] py-[10px]
        m = re.match(r"padding:\s*['\"](\d+)px\s+(\d+)px['\"]", part)
        if m:
            classes.append(f"py-[{m.group(1)}px] px-[{m.group(2)}px]")
            continue
            
        m = re.match(r"padding:\s*(\d+)", part)
        if m:
            v = int(m.group(1))
            classes.append(f"p-{convert_px_to_rem(v)}")
            continue
            
        # If no heuristic rules match, append it back onto the inline style block
        residual_styles.append(part)

    # Return both the abstracted text and what survived the cleanse
    return " ".join(classes), ", ".join(residual_styles)

def process_file(filepath):
    global files_modded
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content

    # Regex targeting: <Element ... style={{ display: 'flex', gap: 10 }} ... >
    # Complex parsing logic specifically extracting inner JSON boundaries. 
    def style_replacer(match):
        pre_tag = match.group(1) # E.g. `<div `
        style_content = match.group(2) # E.g `display: 'flex', gap: 10`
        post_tag = match.group(3) # The rest of the tag.

        # Do not alter dynamic/template strings
        if '`' in style_content or '?' in style_content or '===' in style_content or ')' in style_content:
            return match.group(0)
            
        extracted_classes, residual = map_style_block(style_content)

        if not extracted_classes:
             return match.group(0) # Nothing changed
             
        # Find if className already exists in the pre/post
        class_regex = r'className=(["\'])(.*?)\1'
        
        # We need to inject extracted_classes into standard className string
        def inject_class(tag_str):
            if re.search(class_regex, tag_str):
                return re.sub(class_regex, lambda m: f'className="{m.group(2)} {extracted_classes}"', tag_str, count=1)
            else:
                return tag_str + f' className="{extracted_classes}"'

        # Inject into pre or post
        if re.search(class_regex, pre_tag):
             new_pre = inject_class(pre_tag)
             new_post = post_tag
        elif re.search(class_regex, post_tag):
             new_pre = pre_tag
             new_post = inject_class(post_tag)
        else:
             # Create new className prior to style object
             new_pre = pre_tag + f' className="{extracted_classes}" '
             new_post = post_tag
             
        # If there are residual styles, keep the style tag, otherwise omit it completely
        if residual.strip():
             new_style = f"style={{{{{residual}}}}}"
        else:
             new_style = ""
             
        # Cleanup extra whitespace resulting from deleted tag mappings. 
        final_tag = f"{new_pre}{new_style}{new_post}"
        final_tag = re.sub(r'\s+', ' ', final_tag).replace(' >', '>').replace(' /', '/')
        return final_tag


    # Only modify static styles
    content = re.sub(r'(<[A-Za-z0-9_.]+(?:\s+[^>]*?)?\s+)(?:style=\{\{([^}]+)\}\})(.*?>)', style_replacer, content)

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        files_modded += 1
        print(f"Modded inline styles in {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        if 'node_modules' in root: continue
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                process_file(os.path.join(root, file))

print(f"Modifications made to {files_modded} files.")
