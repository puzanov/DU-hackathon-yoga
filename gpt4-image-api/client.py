import requests

url = "http://localhost:8000/action"
payload = {
    "image_url": "/home/puzanov/src/yoga/gpt4-image-api/images/f639c115-32f4-4954-a16d-c09fb01dad13.jpeg",
    "prompt": "What is wrong with this yoga posture?"
}
response = requests.post(url, json=payload)
print(response.text)
