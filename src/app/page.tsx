"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

const STORAGE_KEY = "todos-v1";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Todo[];
      setTodos(parsed);
    } catch {
      setTodos([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setTodos((prev) => [
      { id: crypto.randomUUID(), text, done: false },
      ...prev,
    ]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.done));
  };

  return (
    <main className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Simple Todo List</h1>
        <p className="mt-1 text-sm text-slate-600">
          {remaining} remaining • {todos.length} total
        </p>

        <form onSubmit={addTodo} className="mt-5 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
          >
            Add
          </button>
        </form>

        <ul className="mt-5 space-y-2">
          {todos.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              No todos yet. Add your first one.
            </li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
              >
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-4 w-4"
                  />
                  <span
                    className={todo.done ? "text-slate-400 line-through" : "text-slate-800"}
                  >
                    {todo.text}
                  </span>
                </label>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="mt-5 flex justify-end">
          <button
            onClick={clearCompleted}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Clear completed
          </button>
        </div>
      </div>
    </main>
  );
}
