import os
import re

def fix_imports_in_dir(directory, recursive=True):
    if not os.path.exists(directory):
        print(f"Directory {directory} does not exist")
        return
    
    # If recursive is False, we only look at files in the directory itself
    items = []
    if recursive:
        for root, dirs, files in os.walk(directory):
            for file in files:
                items.append((root, file))
    else:
        for file in os.listdir(directory):
            if os.path.isfile(os.path.join(directory, file)):
                items.append((directory, file))

    for root, file in items:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = content
            matches = re.findall(r"(['\"])@/(.*?)(['\"])", content)
            if matches:
                rel_to_src = os.path.relpath(filepath, 'apps/web/src')
                depth = len(rel_to_src.split(os.sep)) - 1
                prefix = '../' * depth
                
                for quote_open, path, quote_close in matches:
                    if depth <= 0:
                        new_path = './' + path
                    else:
                        new_path = prefix + path
                    
                    old_val = f"{quote_open}@/{path}{quote_close}"
                    new_val = f"{quote_open}{new_path}{quote_close}"
                    new_content = new_content.replace(old_val, new_val)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Fixed {filepath}")

# Fix files in src root (like middleware.ts, auth.ts)
fix_imports_in_dir('apps/web/src', recursive=False)
# Fix subdirectories
fix_imports_in_dir('apps/web/src/app')
fix_imports_in_dir('apps/web/src/components')
fix_imports_in_dir('apps/web/src/context')
fix_imports_in_dir('apps/web/src/trpc')
