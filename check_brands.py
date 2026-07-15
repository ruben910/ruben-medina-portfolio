import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# First, find the HTML part for the brands row to see how many icons there are
match = re.search(r'<div class="brands-row">(.*?)</div>', html, re.DOTALL)
if match:
    # Print out the matches to debug
    print("Found brands row!")
    print(match.group(1))
