export function validatePatientRegistration(body) {
  const errors = [];

  if (!body.name || typeof body.name !== "string") {
    errors.push("name is required and must be a string");
  }

  if (!body.email || typeof body.email !== "string") {
    errors.push("email is required and must be a string");
  }

  if (!body.password || typeof body.password !== "string") {
    errors.push("password is required and must be a string");
  }

  if (body.phone && typeof body.phone !== "string") {
    errors.push("phone must be a string if provided");
  }

  if (body.gender && typeof body.gender !== "string") {
    errors.push("gender must be a string if provided");
  }

  if (errors.length) {
    return { error: errors };
  }

  return { error: null };
}

