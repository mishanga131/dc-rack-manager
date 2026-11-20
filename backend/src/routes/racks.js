import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getRacks, saveRacks, getDevices, saveDevices } from '../db.js';
import { validateRack } from '../validation.js';

const router = Router();

// рахуємо зайняті юніти і споживання для стійки
function addStats(rack, devices) {
  const rackDevices = devices.filter((d) => d.rackId === rack.id);
  let usedUnits = 0;
  let totalPowerW = 0;
  for (const d of rackDevices) {
    usedUnits += d.unitHeight;
    totalPowerW += d.powerConsumptionW;
  }
  return { ...rack, deviceCount: rackDevices.length, usedUnits, totalPowerW };
}

router.get('/', async (req, res, next) => {
  try {
    const { search, status, sortBy, sortOrder } = req.query;
    let racks = await getRacks();
    const devices = await getDevices();

    if (search) {
      const s = search.toLowerCase();
      racks = racks.filter(
        (r) => r.name.toLowerCase().includes(s) || r.location.toLowerCase().includes(s)
      );
    }

    if (status) {
      racks = racks.filter((r) => r.status === status);
    }

    if (sortBy === 'name') {
      racks.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'unitCapacity' || sortBy === 'maxPowerKw') {
      racks.sort((a, b) => a[sortBy] - b[sortBy]);
    }
    if (sortBy && sortOrder === 'desc') {
      racks.reverse();
    }

    res.json(racks.map((r) => addStats(r, devices)));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const racks = await getRacks();
    const devices = await getDevices();
    const rack = racks.find((r) => r.id === req.params.id);

    if (!rack) {
      return res.status(404).json({ message: 'Стійку не знайдено' });
    }

    const rackDevices = devices
      .filter((d) => d.rackId === rack.id)
      .sort((a, b) => a.unitPosition - b.unitPosition);

    res.json({ ...addStats(rack, devices), devices: rackDevices });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateRack(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Помилка валідації', errors });
    }

    const { name, location, unitCapacity, maxPowerKw, status, description } = req.body;
    const newRack = {
      id: randomUUID(),
      name: name.trim(),
      location: location.trim(),
      unitCapacity,
      maxPowerKw,
      status,
      description: description ? description.trim() : '',
    };

    const racks = await getRacks();
    racks.push(newRack);
    await saveRacks(racks);

    res.status(201).json(newRack);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const racks = await getRacks();
    const index = racks.findIndex((r) => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Стійку не знайдено' });
    }

    const errors = validateRack(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Помилка валідації', errors });
    }

    const { name, location, unitCapacity, maxPowerKw, status, description } = req.body;

    // не можна зменшити місткість нижче зайнятих юнітів
    const devices = await getDevices();
    let maxUsedUnit = 0;
    for (const d of devices) {
      if (d.rackId !== racks[index].id) continue;
      maxUsedUnit = Math.max(maxUsedUnit, d.unitPosition + d.unitHeight - 1);
    }
    if (unitCapacity < maxUsedUnit) {
      return res.status(400).json({
        message: 'Помилка валідації',
        errors: { unitCapacity: `Обладнання займає юніти до ${maxUsedUnit}U, місткість не може бути меншою` },
      });
    }

    racks[index] = {
      ...racks[index],
      name: name.trim(),
      location: location.trim(),
      unitCapacity,
      maxPowerKw,
      status,
      description: description ? description.trim() : '',
    };

    await saveRacks(racks);
    res.json(racks[index]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const racks = await getRacks();
    const rack = racks.find((r) => r.id === req.params.id);

    if (!rack) {
      return res.status(404).json({ message: 'Стійку не знайдено' });
    }

    // видаляємо стійку і все обладнання в ній
    const devices = await getDevices();
    await saveRacks(racks.filter((r) => r.id !== rack.id));
    await saveDevices(devices.filter((d) => d.rackId !== rack.id));

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
