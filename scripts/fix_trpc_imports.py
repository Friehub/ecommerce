import os

def fix_imports(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                if '@/trpc/react' in content:
                    # Calculate depth from src
                    # filepath is apps/web/src/app/...
                    # We want relative to apps/web/src
                    rel_to_src = os.path.relpath(filepath, 'apps/web/src')
                    depth = len(rel_to_src.split(os.sep)) - 1
                    prefix = '../' * depth
                    if depth == 0:
                        new_import = './trpc/react'
                    else:
                        new_import = prefix + 'trpc/react'
                    
                    new_content = content.replace("@/trpc/react", new_import)
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Fixed {filepath} -> {new_import}")

fix_imports('apps/web/src/app')
