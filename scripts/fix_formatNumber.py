import os

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    out = ""
    idx = 0
    while True:
        pos = content.find("formatNumber(", idx)
        if pos == -1:
            out += content[idx:]
            break
            
        out += content[idx:pos + 13]
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
            elif depth == 1 and char in ['}', ',', '\n', ']']:
                content = content[:i] + ')' + content[i:]
                break
            i += 1
            
    if out != original:
        # Wait, my logic modified `content` inside the loop!
        pass

# Let's rewrite it simpler
def fix_file2(filepath):
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
            elif depth == 1 and char in ['}', ',', '\n', ']']:
                # Found the error spot! Insert ')'
                content = content[:i] + ')' + content[i:]
                break
            i += 1
            
    if orig != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print("Fixed", filepath)

for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith((".ts", ".tsx")):
            fix_file2(os.path.join(root, file))
