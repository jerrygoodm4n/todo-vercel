"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todos-v2";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

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

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.done).length;
    const remaining = total - completed;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, remaining, progress };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    if (filter === "active") return todos.filter((todo) => !todo.done);
    if (filter === "completed") return todos.filter((todo) => todo.done);
    return todos;
  }, [todos, filter]);

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setTodos((prev) => [
      { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() },
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

  const completeAll = () => {
    setTodos((prev) => prev.map((todo) => ({ ...todo, done: true })));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/todo-logo.svg" alt="TaskFlow logo" width={42} height={42} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">TaskFlow</h1>
              <p className="text-sm text-slate-600">A cleaner way to track your day</p>
            </div>
          </div>
          <button
            onClick={completeAll}
            disabled={stats.remaining === 0}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Complete all
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
            <span>
              {stats.remaining} left · {stats.completed} done
            </span>
            <span className="font-semibold">{stats.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-600 transition-all"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={addTodo} className="mt-5 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task and hit Enter..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            Add
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["all", "active", "completed"] as Filter[]).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                filter === item
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {visibleTodos.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              {todos.length === 0
                ? "No tasks yet. Start with one above."
                : "No tasks in this filter."}
            </li>
          ) : (
            visibleTodos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span
                    className={todo.done ? "text-slate-400 line-through" : "text-slate-800"}
                  >
                    {todo.text}
                  </span>
                </label>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-sm text-slate-400 transition hover:text-red-600"
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-slate-500">{stats.total} total tasks</span>
          <button
            onClick={clearCompleted}
            disabled={stats.completed === 0}
            className="font-medium text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear completed
          </button>
        </div>
      </div>
    </main>
  );
}
