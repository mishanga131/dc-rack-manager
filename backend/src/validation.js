const statuses = ['active', 'maintenance', 'reserved'];
const deviceTypes = ['server', 'switch', 'ups', 'storage'];

// trim, або null якщо не рядок
function str(value) {
  return typeof value === 'string' ? value.trim() : null;
}

export function validateRack(data) {
  const errors = {};
  const name = str(data.name);
  const location = str(data.location);

  if (name === null || name.length < 3 || name.length > 30) {
    errors.name = 'Назва від 3 до 30 символів';
  }
  if (!location) {
    errors.location = 'Вкажіть локацію';
  }
  if (!Number.isInteger(data.unitCapacity) || data.unitCapacity < 10 || data.unitCapacity > 48) {
    errors.unitCapacity = 'Місткість від 10 до 48 U';
  }
  if (typeof data.maxPowerKw !== 'number' || data.maxPowerKw < 1 || data.maxPowerKw > 30) {
    errors.maxPowerKw = 'Потужність від 1 до 30 кВт';
  }
  if (!statuses.includes(data.status)) {
    errors.status = 'Невірний статус';
  }
  if (data.description !== undefined && data.description !== null) {
    const description = str(data.description);
    if (description === null) errors.description = 'Опис має бути текстом';
    else if (description.length > 200) errors.description = 'Опис до 200 символів';
  }

  return errors;
}

export function validateDevice(data) {
  const errors = {};

  if (!str(data.rackId)) errors.rackId = 'Не вказана стійка';
  if (!str(data.vendorModel)) errors.vendorModel = 'Вкажіть модель';
  if (!deviceTypes.includes(data.deviceType)) errors.deviceType = 'Невірний тип';
  if (!Number.isInteger(data.unitPosition) || data.unitPosition < 1) {
    errors.unitPosition = 'Позиція від 1';
  }
  if (!Number.isInteger(data.unitHeight) || data.unitHeight < 1 || data.unitHeight > 8) {
    errors.unitHeight = 'Висота від 1 до 8 U';
  }
  if (typeof data.powerConsumptionW !== 'number' || data.powerConsumptionW <= 0) {
    errors.powerConsumptionW = 'Споживання має бути більше 0';
  }
  const serial = str(data.serialNumber);
  if (serial === null || serial.length < 4) {
    errors.serialNumber = 'Серійний номер від 4 символів';
  }

  return errors;
}
