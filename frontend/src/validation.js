export const STATUS_LABELS = {
  active: 'В роботі',
  maintenance: 'Обслуговування',
  reserved: 'Зарезервована',
};

export const DEVICE_TYPE_LABELS = {
  server: 'Сервер',
  switch: 'Комутатор',
  ups: 'ДБЖ',
  storage: 'СЗД',
};

// maxUsedUnit - останній зайнятий юніт (для редагування)
export function validateRack(form, maxUsedUnit = 0) {
  const errors = {};
  const name = form.name.trim();
  const capacity = Number(form.unitCapacity);
  const power = Number(form.maxPowerKw);

  if (name.length < 3 || name.length > 30) errors.name = 'Назва від 3 до 30 символів';
  if (!form.location.trim()) errors.location = 'Вкажіть локацію';
  if (!Number.isInteger(capacity) || capacity < 10 || capacity > 48) {
    errors.unitCapacity = 'Ціле число від 10 до 48';
  } else if (capacity < maxUsedUnit) {
    errors.unitCapacity = `Обладнання займає юніти до ${maxUsedUnit}U`;
  }
  if (form.maxPowerKw === '' || power < 1 || power > 30) errors.maxPowerKw = 'Від 1 до 30 кВт';
  if (form.description.length > 200) errors.description = 'До 200 символів';

  return errors;
}

// devices - пристрої, які вже стоять у стійці
export function validateDevice(form, rack, devices) {
  const errors = {};
  const pos = Number(form.unitPosition);
  const height = Number(form.unitHeight);
  const power = Number(form.powerConsumptionW);

  if (!form.vendorModel.trim()) errors.vendorModel = 'Вкажіть модель';
  if (!Number.isInteger(pos) || pos < 1 || pos > rack.unitCapacity) {
    errors.unitPosition = `Від 1 до ${rack.unitCapacity}`;
  }
  if (!Number.isInteger(height) || height < 1 || height > 8) errors.unitHeight = 'Від 1 до 8';
  if (form.powerConsumptionW === '' || power <= 0) errors.powerConsumptionW = 'Більше 0';
  if (form.serialNumber.trim().length < 4) errors.serialNumber = 'Мінімум 4 символи';

  // перевірка слотів
  if (!errors.unitPosition && !errors.unitHeight) {
    const last = pos + height - 1;
    if (last > rack.unitCapacity) {
      errors.unitPosition = `Не влазить: до ${last}U, а в стійці ${rack.unitCapacity}U`;
    }
    for (const d of devices) {
      const dLast = d.unitPosition + d.unitHeight - 1;
      if (pos <= dLast && d.unitPosition <= last) {
        errors.unitPosition = `Зайнято: ${d.vendorModel}`;
      }
    }
  }

  return errors;
}
