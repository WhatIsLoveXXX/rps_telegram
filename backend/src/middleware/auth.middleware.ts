import { validate, parse, type InitData } from '@telegram-apps/init-data-node';
import {
    type ErrorRequestHandler,
    type RequestHandler,
    type Response,
} from 'express';
import dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN || ''; 

function setInitData(res: Response, initData: InitData): void {
    res.locals.initData = initData;
}

function getInitData(res: Response): InitData | undefined {
    return res.locals.initData;
}

export const authMiddleware: RequestHandler = (req, res, next) => {
    const [authType, authData = ''] = (req.header('authorization') || '').split(' ');
    
    switch (authType) {
        case 'tma':
            try {
                validate(authData, token, {
                    expiresIn: 3600,
                });
                setInitData(res, parse(authData));
                return next();
            } catch (e) {
                return next(e);
            } 
        default:
            return res.status(401).json('Unauthorized');
    }
};

export const showInitDataMiddleware: RequestHandler = (_req, res, next) => {
    const initData = getInitData(res);
    if (!initData) {
        return next(new Error('Cant display init data as long as it was not found'));
    }
    res.json(initData);
};

export const defaultErrorMiddleware: ErrorRequestHandler = (err, _req, res,  _next) => {
    res.status(500).json({
        error: err.message,
    });
};