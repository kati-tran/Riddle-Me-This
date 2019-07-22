from bs4 import BeautifulSoup
import requests


def getRiddle() -> dict:
    '''Returns a dict of a riddle and its answer if the answer is
       two words or less'''

    page_link = 'https://riddles.fyi/random-riddles/'
    page_response = requests.get(page_link, timeout=5)
    page_content = BeautifulSoup(page_response.content, "html.parser")
    riddle_find = page_content.find("a", class_ = "query-title-link")
    riddle = str(riddle_find.text)
    answer_find = page_content.find("div", class_ = "su-spoiler-content su-clearfix")
    answer = str(answer_find.text)
    if len(answer.split()) > 3:
        return getRiddle()
    else:
        riddle_dict = {"Riddle": riddle, "Answer": answer}
        return riddle_dict

#def test_outputs() -> str:
#    x = getRiddle()
#    for r in x.values():
#        print(r)

def allRiddles(ridict: dict, rounds: int) -> dict:
    '''Returns a dict with different riddles and no duplicates
       enough for however many rounds'''
    
    riddle = getRiddle()
    if len(ridict) == 0:
        ridict[riddle["Riddle"]] = riddle["Answer"]

    if len(ridict) == rounds:
        return ridict
    else:
        for key,value in riddle.items():
            if value in ridict.values():
                return allRiddles(ridict,rounds)
            else:
                ridict[riddle["Riddle"]] = riddle["Answer"]
                return allRiddles(ridict,rounds)

#def test_outputs2() -> str:
#    x = allRiddles(dict(),100)
#    for i in x.values():
#        print(i)
