export function validateRequest(validator) {
  return (req, res, next) => {
    try {
      const { error } = validator(req.body || {});

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          details: error,
        });
      }

      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid request payload",
      });
    }
  };
}

