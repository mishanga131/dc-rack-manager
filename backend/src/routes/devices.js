import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getRacks, getDevices, saveDevices } from '../db.js';
import { validateDevice } from '../validation.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const errors = validateDevice(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Помилка валідації', errors });
    }

    const { rackId, deviceType, unitPosition, unitHeight, powerConsumptionW } = req.body;
    const vendorModel = req.body.vendorModel.trim();
    const serialNumber = req.body.serialNumber.trim();

    const racks = await getRacks();
    const devices = await getDevices();

    // 1. чи існує стійка
    const rack = racks.find((r) => r.id === rackId);
    if (!rack) {
      return res.status(404).json({ message: 'Стійку не знайдено' });
    }

    // 2. чи влазить пристрій у стійку
    const lastUnit = unitPosition + unitHeight - 1;
    if (lastUnit > rack.unitCapacity) {
      return res.status(400).json({
        message: `Пристрій не влазить: займе до ${lastUnit}U, а в стійці ${rack.unitCapacity}U`,
      });
    }

    // 3. чи не зайняті юніти іншим пристроєм
    for (const d of devices) {
      if (d.rackId !== rackId) continue;
      const dLast = d.unitPosition + d.unitHeight - 1;
      if (unitPosition <= dLast && d.unitPosition <= lastUnit) {
        return res.status(409).json({
          message: `Юніти зайняті пристроєм ${d.vendorModel} (${d.unitPosition}-${dLast}U)`,
        });
      }
    }

    // 4. чи унікальний серійний номер
    if (devices.some((d) => d.serialNumber === serialNumber)) {
      return res.status(409).json({ message: `Серійний номер ${serialNumber} вже існує` });
    }

    const newDevice = {
      id: randomUUID(),
      rackId,
      vendorModel,
      deviceType,
      unitPosition,
      unitHeight,
      powerConsumptionW,
      serialNumber,
    };
    devices.push(newDevice);
    await saveDevices(devices);

    res.status(201).json(newDevice);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const devices = await getDevices();
    const device = devices.find((d) => d.id === req.params.id);

    if (!device) {
      return res.status(404).json({ message: 'Пристрій не знайдено' });
    }

    await saveDevices(devices.filter((d) => d.id !== device.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
