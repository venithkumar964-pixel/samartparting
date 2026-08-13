"""Flask-SQLAlchemy database instance.

Every model in models.py imports `db` from this module and the Flask app
calls `db.init_app(app)` to connect the instance to the application.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()