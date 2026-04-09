import logging
from logging.handlers import RotatingFileHandler
import os
from config import Config

def setup_logger():
    logger = logging.getLogger("ml_api")
    logger.setLevel(logging.INFO)

    if logger.hasHandlers():
        logger.handlers.clear()

    formatter = logging.Formatter(
        "%(asctime)s - %(levelname)s - %(message)s"
    )

    log_file = Config.LOG_FILE
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    fh = RotatingFileHandler(
        log_file,
        maxBytes=5*1024*1024,
        backupCount=3
    )
    fh.setFormatter(formatter)

    ch = logging.StreamHandler()
    ch.setFormatter(formatter)

    logger.addHandler(fh)
    logger.addHandler(ch)

    return logger