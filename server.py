from flask import Flask, send_file
import os

app = Flask(__name__)

app.secret_key = os.environ['FLASK_KEY']

@app.route("/")
def home():
    return send_file("templates/index.html")

if __name__ == "__main__":

    app.debug = True

    app.run(port=5001)
