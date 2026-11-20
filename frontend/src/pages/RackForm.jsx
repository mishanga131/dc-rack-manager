import { useEffect, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import { ConfirmModal } from '../components/Modal.jsx';
import { validateRack } from '../validation.js';
import { Skeleton } from '../components/ui.jsx';

const emptyForm = {
  name: '',
  location: '',
  unitCapacity: '42',
  maxPowerKw: '10',
  status: 'active',
  description: '',
};

export default function RackForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(emptyForm);
  const [startForm, setStartForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [maxUsedUnit, setMaxUsedUnit] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // при редагуванні завантажуємо дані стійки
  useEffect(() => {
    if (!isEdit) return;
    api
      .getRack(id)
      .then((rack) => {
        const data = {
          name: rack.name,
          location: rack.location,
          unitCapacity: String(rack.unitCapacity),
          maxPowerKw: String(rack.maxPowerKw),
          status: rack.status,
          description: rack.description || '',
        };
        setForm(data);
        setStartForm(data);
        let maxUnit = 0;
        for (const d of rack.devices) maxUnit = Math.max(maxUnit, d.unitPosition + d.unitHeight - 1);
        setMaxUsedUnit(maxUnit);
        setLoading(false);
      })
      .catch((err) => {
        toast(err.message, 'error');
        navigate('/racks');
      });
  }, [id]);

  // чи змінив користувач щось у формі
  const changed = JSON.stringify(form) !== JSON.stringify(startForm);

  // блокуємо перехід на іншу сторінку, якщо є незбережені зміни
  const blocker = useBlocker(changed && !saved);

  // попередження при закритті вкладки
  useEffect(() => {
    function onBeforeUnload(e) {
      if (changed && !saved) e.preventDefault();
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [changed, saved]);

  // після збереження переходимо на сторінку стійки
  useEffect(() => {
    if (saved) navigate(`/racks/${saved}`);
  }, [saved]);

  function handleChange(e) {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    // після першої спроби відправки підсвічуємо помилки одразу при введенні
    if (submitted) setErrors(validateRack(newForm, maxUsedUnit));
  }

  // для полів: при виході з поля перевіряємо його
  function handleBlur(e) {
    const fieldError = validateRack(form, maxUsedUnit)[e.target.name];
    setErrors({ ...errors, [e.target.name]: fieldError });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    const formErrors = validateRack(form, maxUsedUnit);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      toast('Перевірте поля форми', 'error');
      return;
    }

    const body = {
      name: form.name.trim(),
      location: form.location.trim(),
      unitCapacity: Number(form.unitCapacity),
      maxPowerKw: Number(form.maxPowerKw),
      status: form.status,
      description: form.description.trim(),
    };

    setSaving(true);
    try {
      const rack = isEdit ? await api.updateRack(id, body) : await api.createRack(body);
      toast(isEdit ? 'Зміни збережено' : 'Стійку створено', 'success');
      setSaved(rack.id);
    } catch (err) {
      setErrors(err.errors);
      toast(err.message, 'error');
    }
    setSaving(false);
  }

  return (
    <section className="narrow">
      <Link to={isEdit ? `/racks/${id}` : '/racks'} className="back-link">← Назад</Link>
      <h1>{isEdit ? 'Редагування стійки' : 'Нова стійка'}</h1>

      {loading ? (
        <div className="panel form">
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={90} />
        </div>
      ) : (
      <form className="panel form" onSubmit={handleSubmit} noValidate>
        <label className={`field ${errors.name ? 'field-error' : ''}`}>
          <span className="field-label">Назва *</span>
          <input className="input" name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} placeholder="Rack-A-101" />
          {errors.name && <span className="field-msg">{errors.name}</span>}
        </label>

        <label className={`field ${errors.location ? 'field-error' : ''}`}>
          <span className="field-label">Локація *</span>
          <input className="input" name="location" value={form.location} onChange={handleChange} onBlur={handleBlur} placeholder="Північний зал (DC-1)" />
          {errors.location && <span className="field-msg">{errors.location}</span>}
        </label>

        <div className="form-row">
          <label className={`field ${errors.unitCapacity ? 'field-error' : ''}`}>
            <span className="field-label">Місткість, U *</span>
            <input className="input" type="number" name="unitCapacity" value={form.unitCapacity} onChange={handleChange} onBlur={handleBlur} />
            {errors.unitCapacity && <span className="field-msg">{errors.unitCapacity}</span>}
          </label>

          <label className={`field ${errors.maxPowerKw ? 'field-error' : ''}`}>
            <span className="field-label">Потужність, кВт *</span>
            <input className="input" type="number" step="0.1" name="maxPowerKw" value={form.maxPowerKw} onChange={handleChange} onBlur={handleBlur} />
            {errors.maxPowerKw && <span className="field-msg">{errors.maxPowerKw}</span>}
          </label>
        </div>

        <label className="field">
          <span className="field-label">Статус *</span>
          <select className="input" name="status" value={form.status} onChange={handleChange}>
            <option value="active">В роботі</option>
            <option value="maintenance">Обслуговування</option>
            <option value="reserved">Зарезервована</option>
          </select>
        </label>

        <label className={`field ${errors.description ? 'field-error' : ''}`}>
          <span className="field-label">Примітки ({form.description.length}/200)</span>
          <textarea className="input" rows="3" name="description" value={form.description} onChange={handleChange} onBlur={handleBlur} />
          {errors.description && <span className="field-msg">{errors.description}</span>}
        </label>

        <div className="modal-actions">
          <Link to={isEdit ? `/racks/${id}` : '/racks'} className="btn">Скасувати</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Збереження…' : isEdit ? 'Зберегти' : 'Створити'}
          </button>
        </div>
      </form>
      )}

      {blocker.state === 'blocked' && (
        <ConfirmModal
          title="Незбережені зміни"
          text="Ви змінили форму. Вийти без збереження?"
          confirmText="Вийти"
          danger
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}
    </section>
  );
}
