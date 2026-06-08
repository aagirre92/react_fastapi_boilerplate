import { useEffect, useState } from "react";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";

const API = "http://localhost:8080/api/items";

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
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Items CRUD</h1>

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
