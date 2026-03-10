import os

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    idx = 0
    while True:
        pos = content.find("formatNumber(", idx)
        if pos == -1:
            break
        
        idx = pos + 13
        depth = 1
        i = idx
        while i < len(content):
            char = content[i]
            if char == '(':
                depth += 1
            elif char == ')':
                depth -= 1
                if depth == 0:
                    break
            elif depth == 1 and char in ['}', ',', '\n', ']', ';', '<']: # terminators
                # Insert ')' exactly here
                content = content[:i] + ')' + content[i:]
                break
            i += 1
        else:
            # Hit EOF while depth was still 1
            if depth == 1:
                content += ')'
            
    if orig != content:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith((".ts", ".tsx")):
            fix_file(os.path.join(root, file))
