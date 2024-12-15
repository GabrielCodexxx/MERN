const { format } = require('date-fns')
const { v4: uuid } = require('uuid');
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')
    const logItem = `${dateTime}\t${uuid()}\t${message}\n` // Use the passed message variable

    try {
        // Ensure the logs directory exists
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        // Append the log to the file
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch (err) {
        console.error('Error writing log:', err)
    }
}

const logger = (req, res, next) => {
    const logMessage = `${req.method}\t${req.url}\t${req.headers.origin || 'No-Origin'}`
    logEvents(logMessage, 'reqLog.log') // Pass the formatted log message
    console.log(`${req.method} ${req.url}`) 
    next() // Pass control to the next middleware
}

module.exports = { logEvents, logger}