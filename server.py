from flask import Flask, send_file, jsonify
from model import db, connect_to_db, Game, Category, Question
import os
import pprint

app = Flask(__name__)

app.secret_key = os.environ['FLASK_KEY']

pp = pprint.PrettyPrinter()

@app.route("/")
def home():
    return send_file("templates/index.html")


@app.route("/gamenames.json")
def game_names():

    games = Game.query.all()
    names = {game.game_id: game.name for game in games}

    return jsonify(names=names)


@app.route("/gamedata.json/<int:id>")
def get_game_data(id):
    # Query database for game data
    game_data = {}
    game = Game.query.filter_by(game_id=id).one()
    categories = Category.query.filter_by(game_id=id).all()

    # Build dictionary for json
    game_data["name"] = game.name
    game_data["finalQ"] = game.final_question
    game_data["finalA"] = game.final_answer
    game_data["categories"] = {}
    for category in categories:
        game_data["categories"][category.name] = {}
        for question_set in category.questions:
            game_data["categories"][category.name][question_set.dollars] = {question_set.question: question_set.answer}
    pp.pprint(game_data)

    return jsonify(game_data)


if __name__ == "__main__":

    app.debug = True
    connect_to_db(app)

    app.run(port=5001)
