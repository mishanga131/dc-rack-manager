import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import Modal, { ConfirmModal } from '../components/Modal.jsx';
import UnitDiagram from '../components/UnitDiagram.jsx';
import { StatusBadge, Skeleton } from '../components/ui.jsx';
import { DEVICE_TYPE_LABELS, validateDevice } from '../validation.js';
import NotFound from './NotFound.jsx';

export default function RackDetails() {
  const { id } = useParams();
  const toast = useToast();
  const [rack, setRack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [startUnit, setStartUnit] = useState('');
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  useEffect(() => {
    loadRack();
  }, [id]);

  async function loadRack() {
    try {
      const data = await api.getRack(id);
      setRack(data);
    } catch (err) {
      if (err.status === 404) setNotFound(true);
      else toast(err.message, 'error');
    }
    setLoading(false);
  }

  function openAddForm(unit) {
    setStartUnit(unit ? String(unit) : '');
    setShowAddForm(true);
  }

  async function deleteDevice() {
    try {
      await api.deleteDevice(deviceToDelete.id);
      toast('Пристрій демонтовано', 'success');
      loadRack();
    } catch (err) {
      toast(err.message, 'error');
    }
    setDeviceToDelete(null);
  }

  if (notFound) return <NotFound text="Стійку не знайдено." />;

  if (loading) {
    return (
      <section>
        <Skeleton height={40} width="40%" />
        <Skeleton height={300} />
      </section>
    );
  }

  if (!rack) return null;

  return (
    <section>
      <div className="page-head">
        <div>
          <Link to="/racks" className="back-link">← До реєстру</Link>
          <h1>{rack.name} <StatusBadge status={rack.status} /></h1>
          <p className="muted">{rack.location}</p>
        </div>
        <div className="row-gap">
          <Link to={`/racks/${rack.id}/edit`} className="btn">Редагувати</Link>
          <button className="btn btn-primary" onClick={() => openAddForm()}>+ Додати пристрій</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><span className="muted small">Місткість</span><strong>{rack.unitCapacity} U</strong></div>
        <div className="stat"><span className="muted small">Зайнято</span><strong>{rack.usedUnits} U</strong></div>
        <div className="stat"><span className="muted small">Вільно</span><strong>{rack.unitCapacity - rack.usedUnits} U</strong></div>
        <div className="stat">
          <span className="muted small">Споживання</span>
          <strong>{(rack.totalPowerW / 1000).toFixed(2)} / {rack.maxPowerKw} кВт</strong>
        </div>
      </div>

      {rack.description && <p className="panel description">{rack.description}</p>}

      <div className="details-layout">
        <div className="panel">
          <h2>Схема юнітів</h2>
          <UnitDiagram capacity={rack.unitCapacity} devices={rack.devices} onSlotClick={openAddForm} />
        </div>

        <div className="panel">
          <h2>Обладнання ({rack.devices.length})</h2>
          {rack.devices.length === 0 ? (
            <div className="empty">
              <h3>У стійці ще немає обладнання</h3>
              <button className="btn btn-primary" onClick={() => openAddForm()}>Додати перший пристрій</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Юніти</th>
                    <th>Модель</th>
                    <th>Тип</th>
                    <th>Вт</th>
                    <th>S/N</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rack.devices.map((d) => (
                    <tr key={d.id}>
                      <td className="mono">{d.unitPosition}-{d.unitPosition + d.unitHeight - 1}</td>
                      <td>{d.vendorModel}</td>
                      <td><span className={`type-tag type-${d.deviceType}`}>{DEVICE_TYPE_LABELS[d.deviceType]}</span></td>
                      <td className="mono">{d.powerConsumptionW}</td>
                      <td className="mono small">{d.serialNumber}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeviceToDelete(d)}>Видалити</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <AddDeviceForm
          rack={rack}
          startUnit={startUnit}
          onClose={() => setShowAddForm(false)}
          onSaved={() => {
            setShowAddForm(false);
            loadRack();
          }}
        />
      )}

      {deviceToDelete && (
        <ConfirmModal
          title="Видалити пристрій?"
          text={`${deviceToDelete.vendorModel} буде демонтовано зі стійки.`}
          confirmText="Видалити"
          danger
          onConfirm={deleteDevice}
          onCancel={() => setDeviceToDelete(null)}
        />
      )}
    </section>
  );
}

function AddDeviceForm({ rack, startUnit, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    vendorModel: '',
    deviceType: 'server',
    unitPosition: startUnit,
    unitHeight: '1',
    powerConsumptionW: '',
    serialNumber: '',
  });
  const [serverError, setServerError] = useState('');

  // перевіряємо слоти одразу при введенні
  const errors = validateDevice(form, rack, rack.devices);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // показуємо помилку поля, якщо його вже заповнювали або була спроба відправки
  function showError(name) {
    if (!submitted && form[name] === '') return null;
    return errors[name];
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setServerError('');
    if (Object.keys(errors).length > 0) return;

    try {
      await api.createDevice({
        rackId: rack.id,
        vendorModel: form.vendorModel.trim(),
        deviceType: form.deviceType,
        unitPosition: Number(form.unitPosition),
        unitHeight: Number(form.unitHeight),
        powerConsumptionW: Number(form.powerConsumptionW),
        serialNumber: form.serialNumber.trim(),
      });
      toast('Пристрій додано', 'success');
      onSaved();
    } catch (err) {
      setServerError(err.message);
    }
  }

  return (
    <Modal title={`Новий пристрій у ${rack.name}`} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        {serverError && <div className="alert alert-error">{serverError}</div>}

        <label className={`field ${showError('vendorModel') ? 'field-error' : ''}`}>
          <span className="field-label">Модель</span>
          <input className="input" name="vendorModel" value={form.vendorModel} onChange={handleChange} placeholder="Dell PowerEdge R750" />
          {showError('vendorModel') && <span className="field-msg">{errors.vendorModel}</span>}
        </label>

        <div className="form-row">
          <label className="field">
            <span className="field-label">Тип</span>
            <select className="input" name="deviceType" value={form.deviceType} onChange={handleChange}>
              <option value="server">Сервер</option>
              <option value="switch">Комутатор</option>
              <option value="ups">ДБЖ</option>
              <option value="storage">СЗД</option>
            </select>
          </label>

          <label className={`field ${showError('powerConsumptionW') ? 'field-error' : ''}`}>
            <span className="field-label">Споживання, Вт</span>
            <input className="input" type="number" name="powerConsumptionW" value={form.powerConsumptionW} onChange={handleChange} />
            {showError('powerConsumptionW') && <span className="field-msg">{errors.powerConsumptionW}</span>}
          </label>
        </div>

        <div className="form-row">
          <label className={`field ${showError('unitPosition') ? 'field-error' : ''}`}>
            <span className="field-label">Початковий юніт</span>
            <input className="input" type="number" name="unitPosition" value={form.unitPosition} onChange={handleChange} />
            {showError('unitPosition') && <span className="field-msg">{errors.unitPosition}</span>}
          </label>

          <label className={`field ${showError('unitHeight') ? 'field-error' : ''}`}>
            <span className="field-label">Висота, U</span>
            <input className="input" type="number" name="unitHeight" value={form.unitHeight} onChange={handleChange} />
            {showError('unitHeight') && <span className="field-msg">{errors.unitHeight}</span>}
          </label>
        </div>

        <label className={`field ${showError('serialNumber') ? 'field-error' : ''}`}>
          <span className="field-label">Серійний номер</span>
          <input className="input" name="serialNumber" value={form.serialNumber} onChange={handleChange} />
          {showError('serialNumber') && <span className="field-msg">{errors.serialNumber}</span>}
        </label>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Скасувати</button>
          <button type="submit" className="btn btn-primary">Додати</button>
        </div>
      </form>
    </Modal>
  );
}
