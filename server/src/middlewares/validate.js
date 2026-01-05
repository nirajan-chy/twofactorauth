const validate = (schema) => (req, res, next) => {
  try {
    const parsedData = schema.parse(req.body); // validate + sanitize
    req.body = parsedData;
    next();
  } catch (error) {
    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (error?.issues && Array.isArray(error.issues)) {
      allErrors = error.issues.map((issue) => ({
        field: issue.path?.join(".") || "unknown",
        message: issue.message || "Validation error",
        code: issue.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation error";
    }

    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      errors: allErrors,
    });
  }
};

module.exports = validate;
