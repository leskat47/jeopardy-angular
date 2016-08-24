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
    final_question = db.Column(db.Text, nullable=False)
    final_answer = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return "<game: %s, owner: %s>" % (self.game_id, self.owner_id)


class Category(db.Model):

    __tablename__ = "categories"

    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('games.game_id'), nullable=False)
    name = db.Column(db.String(30), nullable=False)
    questions = db.relationship('Question', backref=db.backref('category', order_by=id))
    game = db.relationship('Game', backref=db.backref('category', order_by=id))

    def __repr__(self):
        return "<Category: %s>" % (self.name)


class Question(db.Model):

    __tablename__ = "questions"

    q_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('games.game_id'), nullable=False)
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


if __name__ == "__main__":

    from server import app
    connect_to_db(app)
    print "Connected to DB."
