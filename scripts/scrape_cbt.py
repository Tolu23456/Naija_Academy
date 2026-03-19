import requests
from bs4 import BeautifulSoup
import json
import time

SUBJECTS = ['mathematics', 'english-language', 'chemistry', 'physics', 'biology']
MAX_PAGES = 1 # Keep it fast to build a robust sample bank first without getting blocked

cbt_data = {}

for subject in SUBJECTS:
    print(f"Scraping subject: {subject}...")
    cbt_data[subject] = []
    
    for page in range(1, MAX_PAGES + 1):
        url = f"https://myschool.ng/classroom/{subject}?page={page}"
        print(f"  Fetching: {url}")
        res = requests.get(url)
        soup = BeautifulSoup(res.text, "lxml")
        
        # Get all question detail links
        q_links = []
        for a in soup.find_all("a", class_="btn-outline-danger"):
            link = a.get("href")
            if link and "/classroom/" in link:
                q_links.append(link)
                
        for i, q_url in enumerate(q_links):
            print(f"    -> Parsing {i+1}/{len(q_links)}")
            time.sleep(0.5) # Polite crawl rate
            try:
                q_res = requests.get(q_url, timeout=10)
                q_soup = BeautifulSoup(q_res.text, "lxml")
                
                desc = q_soup.find("div", class_="question-desc")
                qst_text = desc.text.strip() if desc else ""
                if not qst_text:
                    continue
                
                # Strip out the typical html embedded inside myschool if we just want raw text
                
                options = []
                for li in q_soup.select("ul.list-unstyled li"):
                    # Example: "A.     25" -> "25"
                    txt = li.text.strip().replace('\n', ' ')
                    if len(txt) > 2 and txt[1] == '.': 
                        txt = txt[2:].strip()
                    options.append(txt)
                    
                ans = q_soup.find("h5", class_="text-success")
                correct_letter = ans.text.split("Option")[-1].strip() if ans else "A"
                # Map letter to index A:0, B:1, C:2, D:3
                letter_map = {'A':0, 'B':1, 'C':2, 'D':3, 'E':4}
                correct_idx = letter_map.get(correct_letter.upper(), 0)
                
                cbt_data[subject].append({
                    "question": qst_text,
                    "options": options,
                    "answerIndex": correct_idx
                })
            except Exception as e:
                print(f"  Failed {q_url}: {e}")

with open("cbt_questions.json", "w") as f:
    json.dump(cbt_data, f, indent=4)
print("\nScraping completed and saved to cbt_questions.json")
