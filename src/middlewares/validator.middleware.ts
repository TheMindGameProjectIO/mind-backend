import * as Joi from "joi";


const validate = (schema: Joi.ObjectSchema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {convert: true});
        const valid = error == null;

        if (valid) {
            next();
        } else {
            const { details } = error;
            const message = details.map(i => i.message).join(',');

            console.log("error", message);
            res.status(422).json({ error: message }) }
    }
}
export default validate;