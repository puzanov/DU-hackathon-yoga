import os
import requests
from flask_cors import CORS
from flask import Flask, request

UPLOAD_FOLDER = './upload'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "/home/puzanov/src/yoga/gpt4-image-api/images"

cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'yogaimage' not in request.files:
            return 'there is no file1 in form!'
        file1 = request.files['yogaimage']
        path = os.path.join(app.config['UPLOAD_FOLDER'], file1.filename)
        file1.save(path)

        url = "http://localhost:8000/action"
        payload = {
            "image_url": path,
            "prompt": "What is the name of the yoga posture and what is wrong with this yoga posture and also give specific instructions on how to get a better pose in this case? Use around 80 words fot the answer"
            #"prompt": "What is the name of the Muay Thai posture and what is wrong with this Muay Thai posture and also give specific instructions on how to get a better pose in this case? Use around 80 words fot the answer"

        }
        response = requests.post(url, json=payload)
        return (response.text)    
    return '''
        Nothing happened
    '''

if __name__ == '__main__':
    app.run()



