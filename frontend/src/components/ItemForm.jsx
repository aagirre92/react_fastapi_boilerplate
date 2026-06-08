import { useState, useEffect } from "react";

// Handles both create (editingItem=null) and edit (editingItem=object) modes
export default function ItemForm({ editingItem, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Sync form fields when the item being edited changes
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
  }, [editingItem]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ name, description });
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>{editingItem ? "Edit Item" : "New Item"}</h2>

      <label style={styles.label}>
        Name
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={styles.input}
        />
      </label>

      <label style={styles.label}>
        Description
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={styles.input}
        />
      </label>

      <div style={styles.buttons}>
        <button type="submit" style={styles.btnPrimary}>
          {editingItem ? "Update" : "Create"}
        </button>
        {editingItem && (
          <button type="button" onClick={onCancel} style={styles.btnSecondary}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

const styles = {
  form: { display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px", marginBottom: "32px" },
  label: { display: "flex", flexDirection: "column", gap: "4px", fontWeight: "bold" },
  input: { padding: "6px 8px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "4px" },
  buttons: { display: "flex", gap: "8px" },
  btnPrimary: { padding: "6px 16px", background: "#4a90e2", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  btnSecondary: { padding: "6px 16px", background: "#ccc", border: "none", borderRadius: "4px", cursor: "pointer" },
};
