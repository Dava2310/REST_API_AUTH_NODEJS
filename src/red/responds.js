const success = (req, res, message = 'Ok', status = 200) => {
    res.status(status).send({
        error: false,
        status: status,
        body: message
    });
}

const error = (req, res, message = 'Internal Error', status = 500) => {
    res.status(status).send({
        error: true,
        statusCode: status,
        body: message
    })
}

export default {success, error}