import "./ItemList.css";

export default function ItemList({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return <p className="item-list-empty">No items yet. Create one above.</p>;
  }

  return (
    <table className="item-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.description ?? "—"}</td>
            <td>
              <button onClick={() => onEdit(item)} className="btn-edit">Edit</button>
              <button onClick={() => onDelete(item.id)} className="btn-delete">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
