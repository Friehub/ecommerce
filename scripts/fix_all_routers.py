import os
import re

def fix_router(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Match the export line
    # export const catalogRouter: ReturnType<typeof createTRPCRouter> = createTRPCRouter({
    match = re.search(r'export const (\w+)Router: ReturnType<typeof createTRPCRouter> = createTRPCRouter\(', content)
    if not match:
        # Try a simpler match if the return type is missing
        match = re.search(r'export const (\w+)Router = createTRPCRouter\(', content)
        if not match:
            return
    
    router_name = match.group(1)
    type_name = router_name[0].upper() + router_name[1:]
    
    # Replace the start
    new_content = re.sub(
        r'export const ' + router_name + r'Router(: ReturnType<typeof createTRPCRouter>)? = createTRPCRouter\(',
        f'const _{router_name}Router = createTRPCRouter(',
        content
    )
    
    # Replace the end
    # }) as any;
    new_content = re.sub(
        r'\}\) as any;',
        f'}});\n\nexport const {router_name}Router = _{router_name}Router as any;\nexport type {type_name}Router = typeof _{router_name}Router;',
        new_content
    )
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Fixed {filepath} -> {type_name}Router")

modules_dir = 'packages/api/modules'
for root, dirs, files in os.walk(modules_dir):
    if 'router' in root and 'index.ts' in files:
        fix_router(os.path.join(root, 'index.ts'))
