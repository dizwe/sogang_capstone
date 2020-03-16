import requests
import random
import time
for i in range(10):
    value = random.randint(1,100)
    requests.get("https://api.thingspeak.com/update?api_key=BSHDWLYOIEV6NDJI&field1="+str(value))
    time.sleep(20)