import requests
import random
import time

IP = "34.235.96.225:8000"
for i in range(10):
    value = random.randint(1,100)
    response = requests.get(f"http://{IP}?field1="+str(value))
    console.log(response.text)
    time.sleep(20)