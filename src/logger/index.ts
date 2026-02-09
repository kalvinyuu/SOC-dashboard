import pino from 'pino';
import pretty from 'pino-pretty';
import { LoggerService } from './service';

const streams = [
    { stream: pretty({ colorize: true, ignore: 'pid,hostname' }) },
    {
        stream: {
            write: (chunk: string) => {
                try {
                    const logEntry = JSON.parse(chunk);
                    LoggerService.saveLog(logEntry);
                } catch (err) {
                    console.error('Failed to parse log chunk', err);
                }
            }
        }
    }
];

export const logger = pino(
    {
        level: process.env.LOG_LEVEL || 'info',
    },
    pino.multistream(streams)
);
