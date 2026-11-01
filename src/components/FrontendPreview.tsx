import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Download,
  LayoutGrid,
  Table as TableIcon,
  X,
  Check,
  Filter,
} from 'lucide-react';
import type { EntityDefinition, RepoAnalysis } from '../types';

interface FrontendPreviewProps {
  analysis: RepoAnalysis;
  entity: EntityDefinition;
  onUpdateEntityData: (entityId: string, newData: Record<string, any>[]) => void;
}

export const FrontendPreview: React.FC<FrontendPreviewProps> = ({
  analysis,
  entity,
  onUpdateEntityData,
}) => {
  const [data, setData] = useState<Record<string, any>[]>(entity.sampleData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keep synced if entity prop changes
  React.useEffect(() => {
    setData(entity.sampleData);
  }, [entity]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Find filterable options if a badge field exists
  const statusField = entity.fields.find((f) => f.type === 'badge');
  const filterOptions = useMemo(() => {
    if (!statusField || !statusField.options) return [];
    return ['ALL', ...statusField.options];
  }, [statusField]);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesStatus =
        activeFilter === 'ALL' ||
        !statusField ||
        item[statusField.name] === activeFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, activeFilter, statusField]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const initial: Record<string, any> = {};
    entity.fields.forEach((f) => {
      if (!f.isId) {
        if (f.type === 'number') initial[f.name] = 0;
        else if (f.type === 'boolean') initial[f.name] = true;
        else if (f.type === 'badge' && f.options?.length) initial[f.name] = f.options[0];
        else initial[f.name] = '';
      }
    });
    setFormData(initial);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Record<string, any>) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const updated = data.map((it) =>
        it.id === editingItem.id ? { ...it, ...formData } : it
      );
      setData(updated);
      onUpdateEntityData(entity.id, updated);
      triggerToast(`${entity.singular} updated successfully.`);
    } else {
      const newRecord = {
        id: `${entity.id.slice(0, 3)}_${Math.random().toString(36).substring(2, 7)}`,
        ...formData,
      };
      const updated = [newRecord, ...data];
      setData(updated);
      onUpdateEntityData(entity.id, updated);
      triggerToast(`New ${entity.singular} created.`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = data.filter((it) => it.id !== id);
    setData(updated);
    onUpdateEntityData(entity.id, updated);
    triggerToast(`${entity.singular} deleted.`);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entity.id}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Exported JSON successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/40 text-slate-100 text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Studio Banner / Generated Preview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Generated Live Interface</span>
            <span aria-hidden="true">·</span>
            <span>Studied from: {analysis.framework}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{filteredData.length} records displayed</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {entity.name} Management
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add {entity.singular}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${entity.plural.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {filterOptions.length > 0 && (
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  activeFilter === opt
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: Table View */}
      {viewMode === 'table' ? (
        <div className="border border-slate-800 rounded-xl bg-slate-900/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  {entity.fields.map((field) => (
                    <th key={field.name} className="px-5 py-3.5 whitespace-nowrap">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={entity.fields.length + 1}
                      className="px-6 py-12 text-center text-slate-400 text-sm"
                    >
                      No records found. Try modifying your search or click "Add {entity.singular}".
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {entity.fields.map((f) => {
                        const val = item[f.name];
                        if (f.isId) {
                          return (
                            <td
                              key={f.name}
                              className="px-5 py-3.5 font-mono text-xs text-slate-400 tabular-nums"
                            >
                              {String(val ?? '')}
                            </td>
                          );
                        }
                        if (f.type === 'number') {
                          return (
                            <td
                              key={f.name}
                              className="px-5 py-3.5 font-mono text-slate-200 tabular-nums"
                            >
                              {typeof val === 'number' ? val.toLocaleString() : val}
                            </td>
                          );
                        }
                        if (f.type === 'badge') {
                          return (
                            <td key={f.name} className="px-5 py-3.5">
                              <span className="text-xs font-medium text-indigo-400">
                                {String(val ?? '')}
                              </span>
                            </td>
                          );
                        }
                        if (f.type === 'boolean') {
                          return (
                            <td key={f.name} className="px-5 py-3.5 text-xs">
                              {val ? (
                                <span className="text-emerald-400">True</span>
                              ) : (
                                <span className="text-slate-500">False</span>
                              )}
                            </td>
                          );
                        }
                        return (
                          <td
                            key={f.name}
                            className="px-5 py-3.5 text-slate-200 font-medium max-w-xs truncate"
                          >
                            {String(val ?? '')}
                          </td>
                        );
                      })}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-xs text-slate-400 tabular-nums">
                    {item.id}
                  </span>
                  <h3 className="text-base font-semibold text-white mt-0.5">
                    {item.title || item.name || `${entity.singular} #${idx + 1}`}
                  </h3>
                </div>
                {item.status && (
                  <span className="text-xs text-indigo-400 font-medium">
                    {item.status}
                  </span>
                )}
              </div>

              {/* Card field metrics */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                {entity.fields
                  .filter((f) => !f.isId && f.name !== 'title' && f.name !== 'name' && f.name !== 'status')
                  .slice(0, 3)
                  .map((f) => (
                    <div key={f.name} className="flex justify-between gap-2">
                      <span className="text-slate-400">{f.label}:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[160px]">
                        {String(item[f.name] ?? '-')}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/80 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingItem ? `Edit ${entity.singular}` : `Create ${entity.singular}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {entity.fields
                .filter((f) => !f.isId)
                .map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {field.label} {field.required && <span className="text-rose-400">*</span>}
                    </label>

                    {field.type === 'badge' && field.options?.length ? (
                      <select
                        value={formData[field.name] ?? field.options[0]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field.name]: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(formData[field.name])}
                            onChange={(e) =>
                              setFormData({ ...formData, [field.name]: e.target.checked })
                            }
                            className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Enabled / Active</span>
                        </label>
                      </div>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        required={field.required}
                        value={formData[field.name] ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]:
                              field.type === 'number' ? Number(e.target.value) : e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    )}
                  </div>
                ))}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
                >
                  {editingItem ? 'Save Updates' : `Create ${entity.singular}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
