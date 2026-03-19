import requests
from bs4 import BeautifulSoup

url = "https://myschool.ng/classroom/mathematics/6"
res = requests.get(url)
soup = BeautifulSoup(res.text, "lxml")

# Try to find the correct answer block. Usually they highlight it or say "Correct Answer: Option C"
# Let's just print all text inside the main answer container if we can guess its class
print("Title:", soup.title.string)

desc = soup.find("div", class_="question-desc")
print("Desc:", desc.text.strip() if desc else "None")

answer_content = soup.find("div", class_="answer-content") # Guessing class name
if not answer_content:
    # Let's search by text "Correct Answer"
    for el in soup.find_all(["p", "div", "span", "strong", "h4"]):
        if "answer" in el.text.lower() and len(el.text) < 100:
            print("Found possible answer block:", el.text.strip(), "Class:", el.get("class"))

print("Looking for option list:")
for li in soup.select("ul.list-unstyled li"):
    print("Option:", li.text.strip())
