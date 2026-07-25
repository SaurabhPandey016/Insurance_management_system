/**
 * Centralized global error handling middleware for Express
 */
export default function errorMiddleware(err, req, res, next) {
  console.error("Unhandled Server Error:", err);

  const status = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Handle Zod validation errors
  if (err.name === "ZodError" || (err.issues && Array.isArray(err.issues))) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // Handle Prisma client errors
  if (err.code) {
    switch (err.code) {
      case "P2002": // Unique constraint failure
        return res.status(409).json({
          success: false,
          message: `A record with this ${err.meta?.target?.join(', ') || 'field'} already exists.`,
        });
      case "P2003": // Foreign key constraint failed
        return res.status(400).json({
          success: false,
          message: "Database relation constraint failed. Invalid reference id provided.",
        });
      case "P2025": // Record not found
        return res.status(404).json({
          success: false,
          message: "The requested record was not found or has been deleted.",
        });
      default:
        message = `Database query error: ${err.message || 'code ' + err.code}`;
    }
  }

  // Return standard error response
  res.status(status).json({
    success: false,
    message,
    errors,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Hide stack trace in production
  });
}
