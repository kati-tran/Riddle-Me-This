from flask import Flask, render_template
from flask.ext.socketio import SocketIO
import json

app = Flask(__name__)
socketio = SocketIO(app)

@app.route("/")
def index():
    return render_template('index.html',)

@socketio.on('send_message')
def handle_source(json_data):
    text = json_data['message'].encode('ascii', 'ignore')
    socketio.emit('echo', {'echo': 'Server Says: '+text})

if __name__ == "__main__":
    socketio.run(app, debug=True)
