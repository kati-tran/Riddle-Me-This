from flask import Flask, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
app.secret_key = 'why'
socketio = SocketIO(app)


@app.route('/', methods = ['GET','POST'])
def main():
    if request.method == 'GET':
        return render_template('index.html')
    elif request.method == 'POST':
        session['username'] = request.form['username']
        return redirect(url_for('lobby', username = session['username']))
    
@app.route('/lobby', methods = ['GET'])
def lobby():
    if request.method == 'GET':
        return render_template('lobby.html', username = session['username'])

@app.route('/contact')
def contact():
    return render_template('index.html')

@app.route('/terms_conditions')
def tos():
    return render_template('tos.html')

@app.route('/game')
def sessions():
    return render_template('session.html')

def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')

@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: ' + str(json))
    socketio.emit('my response', json, callback=messageReceived)

if __name__ == '__main__':
    socketio.run(app, debug=True)
