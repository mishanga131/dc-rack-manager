import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import { ConfirmModal } from '../components/Modal.jsx';
import { StatusBadge, Skeleton } from '../components/ui.jsx';

export default function RacksList() {
  // фільтри беремо з URL, щоб посилання можна було скопіювати
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const order = searchParams.get('order') || 'asc';

  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rackToDelete, setRackToDelete] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadRacks();
  }, [search, status, sortBy, order]);

  async function loadRacks() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = order;
      }
      const data = await api.getRacks(params);
      setRacks(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  function changeFilter(name, value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    setSearchParams(params, { replace: true });
  }

  function resetFilters() {
    setSearchParams({});
  }

  async function deleteRack() {
    try {
      await api.deleteRack(rackToDelete.id);
      setRacks(racks.filter((r) => r.id !== rackToDelete.id));
      toast('Стійку видалено', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
    setRackToDelete(null);
  }

  const hasFilters = search || status || sortBy;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Реєстр серверних стійок</h1>
          <p className="muted">Облік шаф та обладнання дата-центру</p>
        </div>
        <Link to="/racks/new" className="btn btn-primary">+ Нова стійка</Link>
      </div>

      <div className="filters">
        <input
          className="input"
          placeholder="Пошук за назвою або локацією..."
          value={search}
          onChange={(e) => changeFilter('search', e.target.value)}
        />
        <select className="input" value={status} onChange={(e) => changeFilter('status', e.target.value)}>
          <option value="">Усі статуси</option>
          <option value="active">В роботі</option>
          <option value="maintenance">Обслуговування</option>
          <option value="reserved">Зарезервована</option>
        </select>
        <select className="input" value={sortBy} onChange={(e) => changeFilter('sortBy', e.target.value)}>
          <option value="">Без сортування</option>
          <option value="name">За назвою</option>
          <option value="unitCapacity">За місткістю</option>
          <option value="maxPowerKw">За потужністю</option>
        </select>
        <select className="input" value={order} onChange={(e) => changeFilter('order', e.target.value)}>
          <option value="asc">За зростанням</option>
          <option value="desc">За спаданням</option>
        </select>
        {hasFilters && <button className="btn" onClick={resetFilters}>Скинути</button>}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-sm" onClick={loadRacks}>Повторити</button>
        </div>
      )}

      {loading && (
        <div className="grid">
          <div className="card"><Skeleton height={120} /></div>
          <div className="card"><Skeleton height={120} /></div>
          <div className="card"><Skeleton height={120} /></div>
        </div>
      )}

      {!loading && !error && racks.length === 0 && (
        <div className="empty">
          <h3>Стійок не знайдено</h3>
          {hasFilters ? (
            <button className="btn btn-primary" onClick={resetFilters}>Скинути фільтри</button>
          ) : (
            <Link to="/racks/new" className="btn btn-primary">Створити першу стійку</Link>
          )}
        </div>
      )}

      {!loading && racks.length > 0 && (
        <div className="grid">
          {racks.map((rack) => (
            <div key={rack.id} className="card">
              <div className="card-head">
                <Link to={`/racks/${rack.id}`} className="card-title">{rack.name}</Link>
                <StatusBadge status={rack.status} />
              </div>
              <div className="muted small">{rack.location}</div>

              <Progress
                label="Юніти"
                text={`${rack.usedUnits} / ${rack.unitCapacity} U`}
                percent={(rack.usedUnits / rack.unitCapacity) * 100}
              />
              <Progress
                label="Енергоспоживання"
                text={`${(rack.totalPowerW / 1000).toFixed(2)} / ${rack.maxPowerKw} кВт`}
                percent={(rack.totalPowerW / (rack.maxPowerKw * 1000)) * 100}
              />
              <div className="muted small">Пристроїв: {rack.deviceCount}</div>

              <div className="card-actions">
                <Link to={`/racks/${rack.id}`} className="btn btn-sm">Паспорт</Link>
                <Link to={`/racks/${rack.id}/edit`} className="btn btn-sm">Редагувати</Link>
                <button className="btn btn-sm btn-danger" onClick={() => setRackToDelete(rack)}>Видалити</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rackToDelete && (
        <ConfirmModal
          title="Видалити стійку?"
          text={`Стійка ${rackToDelete.name} і все обладнання в ній буде видалено.`}
          confirmText="Видалити"
          danger
          onConfirm={deleteRack}
          onCancel={() => setRackToDelete(null)}
        />
      )}
    </section>
  );
}

function Progress({ label, text, percent }) {
  let color = 'meter-low';
  if (percent >= 70) color = 'meter-mid';
  if (percent >= 90) color = 'meter-high';

  return (
    <div className="meter">
      <div className="meter-row">
        <span className="small muted">{label}</span>
        <span className="small mono">{text}</span>
      </div>
      <div className="meter-bar">
        <div className={`meter-fill ${color}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}
