export default function ItemList({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return <p style={{ color: "#888" }}>No items yet. Create one above.</p>;
  }

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>ID</th>
          <th style={styles.th}>Name</th>
          <th style={styles.th}>Description</th>
          <th style={styles.th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td style={styles.td}>{item.id}</td>
            <td style={styles.td}>{item.name}</td>
            <td style={styles.td}>{item.description ?? "—"}</td>
            <td style={styles.td}>
              <button onClick={() => onEdit(item)} style={styles.btnEdit}>Edit</button>
              <button onClick={() => onDelete(item.id)} style={styles.btnDelete}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles = {
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", borderBottom: "2px solid #ccc", padding: "8px" },
  td: { borderBottom: "1px solid #eee", padding: "8px" },
  btnEdit: { marginRight: "8px", padding: "4px 12px", cursor: "pointer", background: "#f0ad4e", border: "none", borderRadius: "4px" },
  btnDelete: { padding: "4px 12px", cursor: "pointer", background: "#d9534f", color: "#fff", border: "none", borderRadius: "4px" },
};
