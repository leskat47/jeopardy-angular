from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):

    __tablename__ = "users"

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)
    username = db.Column(db.String)
    password = db.Column(db.String)

    def __repr__(self):
        return "<user_id: %s, username: %s>" % (self.user_id, self.username)


class Game(db.Model):

    __tablename__ = "games"

    game_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    name = db.Column(db.String(20), nullable=False)
    final_question = db.Column(db.Text, nullable=False)
    final_answer = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return "<game: %s, owner: %s>" % (self.game_id, self.owner_id)


class Category(db.Model):

    __tablename__ = "categories"

    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('games.game_id'), nullable=False)
    name = db.Column(db.String(30), nullable=False)
    questions = db.relationship('Question', backref=db.backref('category'))
    game = db.relationship('Game', backref=db.backref('category'))

    def __repr__(self):
        return "<Category: %s>" % (self.name)


class Question(db.Model):

    __tablename__ = "questions"

    q_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'), nullable=False)
    dollars = db.Column(db.Integer, nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return "<game: %s, question: %s>" % (self.game_id, self.question)


def connect_to_db(app):
    """Connect the database to Flask app."""

    # Configure to use SQLite database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///jeopardy'
    db.app = app
    db.init_app(app)


def seed_data():
    user = User(email="jessica@hb.com", username="jessica", password="hb12")
    db.session.add(user)
    db.session.commit()

    game_data = {'name': 'Game 1',
                 'categories': {'Command Line': {
                                '100': {'Is another name for Command Line': 'What is Shell, GUI, Terminal or Console?'},
                                '200': {'Its acronym is pwd.': 'What is Print Working Directory?'},
                                '300': {'A command to see the built in manual': 'What is "man"?'},
                                '400': {'A command to print to STDOUT': 'What is "echo"?'},
                                '500': {'A command to seach within files': 'What is "grep"?'},
                                },
                                'TV': {
                                    '100':
                                    {'A weekly television series on NBC was the first to air completely in color in 1959': 'What is the show Bonanza?'},
                                    '200':
                                    {'The family name of the main characters in the Cosby Show which ran from 1984-1992': 'What is The Huxtable Family?'},
                                    '300':
                                    {'A popular children show that debuted on PBS in 1969': 'What is Sesame Street?'},
                                    '400':
                                    {'The breakout star who played Stella Carlin on the third season of Orange Is the New Black': 'Who is Ruby Rose?'},
                                    '500':
                                    {'The last guest on the Late Show with David Letterman': 'Who is Bill Murray?'},
                                    },
                                'Movies': {
                                    '100':
                                    {'Sings the theme song for "Spectre", the new James Bond film': 'Who is Sam Smith?'},
                                    '200':
                                    {'Charlize Theron played this bad-ass character in "Mad Max: Fury Road"': 'Who is Furiosa?'},
                                    '300':
                                    {'Won the Best Picture at the 2015 Academy Awards': 'What is Birdman?'},
                                    '400':
                                    {'Amy Schumers well-received comedy "Trainwreck" co-starred which famous NBA player': 'Who is Lebron James?'},
                                    '500':
                                    {'Cast as Belle in the upcoming Disney live-action "Beauty and the Beast"': 'Who is Emma Watson?'},
                                    },
                                'Python': {
                                    '100':
                                    {'The hardest part of programming': 'What is naming variables?'},
                                    '200':
                                    {'A one-line summary for fucntions': 'What is Docstrings?'},
                                    '300':
                                    {'The data structure that range() returns': 'What is list?'},
                                    '400':
                                    {'The list of things defined for a function to receive': 'What are parameters?'},
                                    '500':
                                    {'The Zen of Python poem prints out using this command': 'What is "import this"?'},
                                    },
                                'Ada or Grace': {
                                    '100': {'She is the first computer programmer in history': 'Who is Ada?'},
                                    '200': {'She retired from the navy at the standard age of 60, but was repeatedly recalled until her eighties': 'Who is Grace?'},
                                    '300': {'Her most famous quotes, which is often attributed to others, is: "It\'s easier to ask forgiveness than it is to get permission."': 'Who is Grace?'},
                                    '400': {'She was described as "The most coarse and vulgar woman in England. . ."': 'Who is Ada?'},
                                    '500': {'When she was younger she believed she could fly, and wrote illustrated a guide called Flyology': 'Who is Ada?'},
                                    },
                                'Staff': {
                                    '100': {'Used to live in a communal, falling-down 28-room mansion in baltimore': 'Who is Joel?'},
                                    '200': {'Carried Stephen Hawking\'s wheelchair with him in it': 'Who is Henry?'},
                                    '300': {'Has a betta fish - and talks to it A LOT': 'Who is Meggie?'},
                                    '400': {'This persons great-great-great uncle was president of Mexico': 'Who is Leslie?'},
                                    '500': {'Bungy jumped off the 3rd largest bungy jump distance in the world': 'Who is Ally?'},
                                    },
                                }}
    final_question = "A style guide for python, its acronym is PEP"
    final_answer = "What are Python Enhancement Proposals?"

    game = Game(owner_id=user.user_id, name=game_data["name"], final_question=final_question, final_answer=final_answer)
    db.session.add(game)
    db.session.commit()
    for category, questions in game_data["categories"].items():
        new_category = Category(game_id=game.game_id, name=category)
        db.session.add(new_category)
        db.session.commit()
        for cost, qa in questions.items():
            for ques, ans in qa.items():
                new_question = Question(category_id=new_category.category_id,
                                        dollars=cost, question=ques, answer=ans)
                db.session.add(new_question)
                db.session.commit()

    return


if __name__ == "__main__":

    from server import app
    connect_to_db(app)
    print "Connected to DB."
