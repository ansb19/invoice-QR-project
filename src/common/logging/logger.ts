import { EnvConfig } from "@/config/env.config";
import path from "path";
import Container from "typedi";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const config = Container.get(EnvConfig);
const logDirectory = path.resolve("logs") // 절대 경로로 처리

const dailyRotateFileTransport = new DailyRotateFile({
    dirname: logDirectory,
    filename: "invoice_qr-%DATE.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
})

const koreanTimeFormat = format.combine(
    format.timestamp({
        format: () => new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    }),

    format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
)

export const logger = createLogger({
    level: config.NODE_ENV === "production" ? "error" : "debug", //로그 레벨 설정
    format: koreanTimeFormat,
    transports: [
        new transports.Console(),
        dailyRotateFileTransport,
    ]
})