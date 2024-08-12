/**
 * Sends a success response to the client.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {string|object} [message='Ok'] - The message or data to include in the response body.
 * @param {number} [status=200] - The HTTP status code for the response.
 * @returns {void}
 * 
 * @example
 * // Sending a success response with a message
 * success(req, res, 'User created successfully', 201);
 * 
 * @example
 * // Sending a success response with an object as body
 * success(req, res, { id: 1, name: "John Doe" }, 200);
 * 
 * @example
 * // Default success response
 * success(req, res);
 */
const success = (req, res, message = 'Ok', status = 200) => {
    res.status(status).send({
        error: false,
        status: status,
        body: message
    });
}

/**
 * Sends an error response to the client.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {string|object} [message='Internal Error'] - The message or data to include in the response body.
 * @param {number} [status=500] - The HTTP status code for the response.
 * @returns {void}
 * 
 * @example
 * // Sending an error response with a custom message
 * error(req, res, 'User not found', 404);
 * 
 * @example
 * // Sending an error response with an object as body
 * error(req, res, { message: 'Validation failed' }, 422);
 * 
 * @example
 * // Default error response
 * error(req, res);
 */
const error = (req, res, message = 'Internal Error', status = 500) => {
    res.status(status).send({
        error: true,
        statusCode: status,
        body: message
    })
}

export default {success, error}