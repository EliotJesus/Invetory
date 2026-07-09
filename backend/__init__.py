from pathlib import Path

from flask import Flask, render_template

from .routes import devices_bp


PROJECT_ROOT = Path(__file__).resolve().parent.parent


def create_app():
    app = Flask(
        __name__,
        static_folder=str(PROJECT_ROOT / "static"),
        template_folder=str(PROJECT_ROOT / "templates"),
    )

    @app.route("/")
    def home():
        return render_template("index.html")

    app.register_blueprint(devices_bp)

    return app
