import { useEffect, useState } from "react";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import "./App.css";

const API = `/api/items`;

export default function App() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const res = await fetch(`${API}/`);
    const data = await res.json();
    setItems(data);
  }

  async function handleSave(formData) {
    if (editingItem) {
      // PUT — update existing
      await fetch(`${API}/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setEditingItem(null);
    } else {
      // POST — create new
      await fetch(`${API}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    fetchItems();
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchItems();
  }

  return (
    <div className="app-container">
      <h1>Items CRUD app. Nº items: {items.length}</h1>

      <ItemForm
        editingItem={editingItem}
        onSave={handleSave}
        onCancel={() => setEditingItem(null)}
      />

      <ItemList
        items={items}
        onEdit={setEditingItem}
        onDelete={handleDelete}
      />
    </div>
  );
}
