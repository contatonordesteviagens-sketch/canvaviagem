import os
import subprocess

with open('src/lib/fabrica-compose-art.ts', 'r', encoding='utf-8') as f:
    target = f.read()

newBlock = subprocess.check_output(['git', 'show', '3974468:src/lib/fabrica-compose-art.ts']).decode('utf-8')

start_marker = "      // Card dimens"
end_marker = '      return canvas.toDataURL("image/png");\n    }\n    return canvas.toDataURL("image/png");\n  };\n'

start_idx = target.find(start_marker)
end_idx = target.find(end_marker) + len(end_marker)

new_start_idx = newBlock.find(start_marker)
new_end_idx = newBlock.find(end_marker) + len(end_marker)

if start_idx > 0 and target.find(end_marker) > 0 and new_start_idx > 0 and newBlock.find(end_marker) > 0:
    replacement = newBlock[new_start_idx:new_end_idx]
    with open('src/lib/fabrica-compose-art.ts', 'w', encoding='utf-8') as f:
        f.write(target[:start_idx] + replacement + target[end_idx:])
    print('Replaced successfully')
else:
    print('Failed to find markers')
    print('Target start:', start_idx, 'end:', target.find(end_marker))
    print('New start:', new_start_idx, 'end:', newBlock.find(end_marker))
