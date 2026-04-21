export function validateAppointmentCreation(body) {
  const errors = [];

  if (!body.patient || typeof body.patient !== "string") {
    errors.push("patient is required and must be a string");
  }

  if (!body.doctor || typeof body.doctor !== "string") {
    errors.push("doctor is required and must be a string");
  }

  if (!body.appointmentDate || typeof body.appointmentDate !== "string") {
    errors.push("appointmentDate is required and must be a string");
  }

  if (!body.timeSlot || typeof body.timeSlot !== "string") {
    errors.push("timeSlot is required and must be a string");
  }

  if (body.symptoms && typeof body.symptoms !== "string") {
    errors.push("symptoms must be a string if provided");
  }

  if (errors.length) {
    return { error: errors };
  }

  return { error: null };
}

