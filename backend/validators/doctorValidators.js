export function validateDoctorCreation(body) {
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

  if (body.specialization && typeof body.specialization !== "string") {
    errors.push("specialization must be a string if provided");
  }

  if (body.fee && typeof body.fee !== "number") {
    errors.push("fee must be a number if provided");
  }

  if (errors.length) {
    return { error: errors };
  }

  return { error: null };
}

