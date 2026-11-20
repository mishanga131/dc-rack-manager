const statuses = ['active', 'maintenance', 'reserved'];
const deviceTypes = ['server', 'switch', 'ups', 'storage'];

export function validateRack(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 3 || data.name.trim().length > 30) {
    errors.name = 'Назва від 3 до 30 символів';
  }
  if (!data.location || !data.location.trim()) {
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
  if (data.description && data.description.length > 200) {
    errors.description = 'Опис до 200 символів';
  }

  return errors;
}

export function validateDevice(data) {
  const errors = {};

  if (!data.rackId) errors.rackId = 'Не вказана стійка';
  if (!data.vendorModel || !data.vendorModel.trim()) errors.vendorModel = 'Вкажіть модель';
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
  if (!data.serialNumber || data.serialNumber.length < 4) {
    errors.serialNumber = 'Серійний номер від 4 символів';
  }

  return errors;
}
