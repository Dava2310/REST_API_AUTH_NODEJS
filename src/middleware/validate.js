import responds from "../red/responds.js";

const validateAndConvertId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        // If the ID is not found in the parameters of the URL
        if (!id) {
            return responds.error(req, res, {message: `${paramName} is required`}, 400);
        }

        const idInt = parseInt(id, 10);

        // In case the ID is not an integer number
        if (isNaN(idInt)) {
            return responds.error(req, res, {message: `Invalid ${paramName}`}, 400);
        }

        req.params[paramName] = idInt;
        next();
    };
};

export default {validateAndConvertId};