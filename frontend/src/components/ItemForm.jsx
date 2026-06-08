import { useState, useEffect } from "react";
import "./ItemForm.css";

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
    <form onSubmit={handleSubmit} className="item-form">
      <h2>{editingItem ? "Edit Item" : "New Item"}</h2>

      <label>
        Name
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </label>

      <label>
        Description
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </label>

      <div className="form-buttons">
        <button type="submit" className="btn-primary">
          {editingItem ? "Update" : "Create"}
        </button>
        {editingItem && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
