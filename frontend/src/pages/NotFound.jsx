import { Link } from 'react-router-dom';

export default function NotFound({ text }) {
  return (
    <section className="notfound">
      <div className="notfound-code">404</div>
      <h1>Вузол не знайдено</h1>
      <p className="muted">
        {text || 'Запитуваний розділ або вузол дата-центру не існує чи був демонтований.'}
      </p>
      <Link to="/racks" className="btn btn-primary">До реєстру стійок</Link>
    </section>
  );
}
