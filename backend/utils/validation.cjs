function validateJobPayload(payload) {
  const errors = [];
  const { title, company, location, salary, type, description } = payload || {};

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push('title is required');
  }
  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    errors.push('company is required');
  }
  if (!location || typeof location !== 'string' || location.trim().length < 2) {
    errors.push('location is required');
  }

  if (salary !== undefined && salary !== null && salary !== '') {
    const salaryText = String(salary).trim();
    const rangePattern = /^\d+(?:\s*-\s*\d+)?$/;
    if (!rangePattern.test(salaryText)) {
      errors.push('salary must be numeric or a numeric range like 80000-120000');
    }
  }

  if (!type || typeof type !== 'string' || !['Full-time', 'Part-time', 'Contract', 'Remote'].includes(type)) {
    errors.push('type must be one of Full-time, Part-time, Contract, Remote');
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push('description must be a string');
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = { validateJobPayload };
