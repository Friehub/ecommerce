import os

routers = [
    ('iam', 'Iam'),
    ('catalog', 'Catalog'),
    ('inventory', 'Inventory'),
    ('cart', 'Cart'),
    ('promo', 'Promo'),
    ('order', 'Order'),
    ('payment', 'Payment'),
    ('seller', 'Seller'),
    ('logistics', 'Logistics'),
    ('review', 'Review'),
    ('return', 'Return'),
    ('content', 'Content'),
    ('ops', 'Ops'),
    ('revenue', 'Revenue'),
    ('dispute', 'Dispute'),
    ('admin', 'Admin'),
    ('notification', 'Notification'),
    ('advertising', 'Advertising'),
    ('affiliate', 'Affiliate'),
    ('media', 'Media'),
]

content = "import { createTRPCRouter } from './trpc'\n"
for name, type_prefix in routers:
    content += f"import {{ {name}Router, type {type_prefix}Router }} from './modules/{name}/router'\n"

content += "\nconst _appRouter = createTRPCRouter({\n"
for name, type_prefix in routers:
    content += f"  {name}: {name}Router as {type_prefix}Router,\n"
content += "});\n\n"
content += "export const appRouter = _appRouter as any;\n"
content += "export type AppRouter = typeof _appRouter;\n"

with open('packages/api/root.ts', 'w') as f:
    f.write(content)
print("Regenerated root.ts")
