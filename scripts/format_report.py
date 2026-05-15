import re
import os
from collections import Counter

input_file = '/home/oxisrael/Friehub/Taas/jumia-clone/GENSENSE_REPORT_RAW.txt'
output_file = '/home/oxisrael/Friehub/Taas/jumia-clone/GENSENSE_REPORT.md'

ignore_patterns = ['target/', 'node_modules/', 'dist/', '.next/', 'build/', '.git/']

def process(target_lang=None):
    with open(input_file, 'r') as f:
        lines = f.readlines()

    report_title = "GenSense Audit Report: Jumia Clone"
    
    findings_list = []
    filtered_count = 0
    
    current_finding = []

    def handle_finding(finding_lines):
        nonlocal filtered_count
        if not finding_lines:
            return
            
        header = finding_lines[0]
        last_paren_start = header.rfind('(')
        last_paren_end = header.rfind(')')
        
        if last_paren_start != -1 and last_paren_end != -1:
            loc = header[last_paren_start+1:last_paren_end]
            path_parts = loc.split(':')
            if len(path_parts) >= 3:
                path = path_parts[0]
                line_num = path_parts[1]
                col_num = path_parts[2]
                
                if any(p in path for p in ignore_patterns):
                    filtered_count += 1
                    return
                
                # Language filtering
                ext = path.split('.')[-1].lower()
                if target_lang:
                    if target_lang == 'rust' and ext != 'rs': return
                    if target_lang == 'typescript' and ext not in ['ts', 'tsx']: return
                    if target_lang == 'javascript' and ext not in ['js', 'jsx']: return
                
                sev_end = header.find(']')
                severity = header[1:sev_end]
                
                rest = header[sev_end+2:]
                rule_end = rest.find(':')
                rule_id = rest[:rule_end]
                observation = rest[rule_end+2:last_paren_start].strip()
                
                finding = {
                    'severity': severity,
                    'rule_id': rule_id,
                    'path': path,
                    'line': line_num,
                    'col': col_num,
                    'observation': observation,
                    'details': []
                }
                
                for detail in finding_lines[1:]:
                    if detail.startswith('- Impact:'):
                        finding['impact'] = detail.replace('- Impact:', '').strip()
                    elif detail.startswith('- Suggestion:'):
                        finding['suggestion'] = detail.replace('- Suggestion:', '').strip()
                    else:
                        finding['details'].append(detail)
                
                findings_list.append(finding)

    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith('[CRITICAL]') or line.startswith('[WARNING]') or line.startswith('[INFO]'):
            handle_finding(current_finding)
            current_finding = [line]
        elif current_finding:
            current_finding.append(line)

    handle_finding(current_finding)

    # Generate Summary
    severity_counts = Counter(f['severity'] for f in findings_list)
    rule_counts = Counter(f['rule_id'] for f in findings_list)
    file_counts = Counter(f['path'] for f in findings_list)
    
    md_content = f"# {report_title}\n\n"
    md_content += f"**Date:** 2026-05-15\n"
    md_content += f"**Engine Version:** 0.2.2\n"
    if target_lang:
        md_content += f"**Language Filter:** {target_lang}\n"
    md_content += "\n## Executive Summary\n\n"
    md_content += f"- **Total Findings:** {len(findings_list)}\n"
    md_content += f"- **Filtered Artifacts:** {filtered_count}\n"
    md_content += "\n### Findings by Severity\n\n"
    for sev in ['CRITICAL', 'WARNING', 'INFO']:
        count = severity_counts.get(sev, 0)
        md_content += f"- **{sev}:** {count}\n"
    
    md_content += "\n### Top Problematic Files\n\n"
    for file, count in file_counts.most_common(5):
        md_content += f"- `{file}`: {count} findings\n"
    
    md_content += "\n### Most Frequent Rules\n\n"
    for rule, count in rule_counts.most_common(10):
        md_content += f"- **{rule}:** {count}\n"
    
    md_content += "\n---\n\n## Detailed Findings\n\n"
    
    for f in findings_list:
        md_content += f"### {f['severity']}: {f['rule_id']}\n"
        md_content += f"- **File:** `{f['path']}:{f['line']}:{f['col']}`\n"
        md_content += f"- **Observation:** {f['observation']}\n"
        if 'impact' in f:
            md_content += f"- **Impact:** {f['impact']}\n"
        if 'suggestion' in f:
            md_content += f"- **Suggestion:** {f['suggestion']}\n"
        md_content += "\n"

    with open(output_file, 'w') as f:
        f.write(md_content)

    print(f"Generated {output_file} with {len(findings_list)} findings.")

if __name__ == "__main__":
    import sys
    lang = sys.argv[1] if len(sys.argv) > 1 else None
    process(lang)
