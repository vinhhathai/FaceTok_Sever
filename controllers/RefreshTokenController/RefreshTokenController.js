'use strict';
//----------------------------------------------------------------
const jwt = require('jsonwebtoken');
const { errorCode, errorMessage } = require('../../common/enum/error')
require('dotenv').config()

exports.refreshToken = async (req, res) => {

    try {
        // Get refresh token from client
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: "/auth/refresh-token",
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.REFRESH_TOKEN_NOT_FOUND
                }
            });
        }

        // Verify refresh token and generate new access token
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
            const accessToken = jwt.sign({ _id: decoded._id }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '5m' });

            return res.status(200).json({
                accessToken: accessToken
            });
        } catch (error) {
            return res.status(403).json({
                timestamp: new Date().toISOString(),
                path: "/auth/refresh-token",
                code: errorCode.UNAUTHORIZED,
                error: {
                    name: errorMessage.INVALID_TOKEN
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/auth/refresh-token",
            code: errorCode.ERR_CREATE_ACCESS_TOKEN_FAILED,
            error: {
                name: error.message
            }
        });
    }
};
