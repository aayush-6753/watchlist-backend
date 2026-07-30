const validate = (schema) => {
    // Safety check to ensure schema exists before returning middleware
    if (!schema || typeof schema.safeParse !== 'function') {
        throw new Error('Validation Middleware Error: A valid Zod schema was not passed to validate(). Check your route definition and imports.');
    }

    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errorMap = new Map();

            result.error.issues.forEach((err) => {
                const field = err.path.join('.');
                if (!errorMap.has(field)) {
                    errorMap.set(field, err.message);
                }
            });

            const formattedErrors = Array.from(errorMap.entries()).map(([field, message]) => ({
                field,
                message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: formattedErrors
            });
        }

        req.body = result.data;
        next();
    };
};

module.exports = validate;