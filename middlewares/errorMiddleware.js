exports.errorHandler = (err, req, res, next) => {
    res.status(500).json({
        message: 'An error occurred',
        error: err.message
    });
};
