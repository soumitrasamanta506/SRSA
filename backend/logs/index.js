import { createLogger, format, transports} from "winston";
import  'winston-daily-rotate-file';

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '5d'
          })
    ]
});

export default logger;