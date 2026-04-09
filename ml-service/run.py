from app import create_app
from config import Config
from app.logger import setup_logger

app = create_app()
logger = setup_logger()

if __name__ == "__main__":
    logger.info(f"Server starting on port {Config.PORT} (debug={Config.DEBUG})")
    app.run(port=Config.PORT, debug=Config.DEBUG)